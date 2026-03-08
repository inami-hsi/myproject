import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createUntypedServiceRoleClient } from '@/lib/supabase/server'
import { getStripe, getPlanFromPriceId } from '@/lib/stripe'
import { sendPlanChanged } from '@/lib/email'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Handle evergreen offer payments
        if (session.metadata?.type === 'evergreen_offer') {
          const evergreenSupabase = createUntypedServiceRoleClient()
          const registrationId = session.metadata.registration_id
          const campaignId = session.metadata.campaign_id

          await evergreenSupabase
            .from('payments')
            .update({ status: 'succeeded', stripe_payment_id: session.payment_intent as string })
            .eq('registration_id', registrationId)
            .eq('stripe_payment_id', session.id)

          // Send purchase confirmation email
          try {
            await sendEvergreenPurchaseEmail(evergreenSupabase, registrationId, campaignId)
          } catch (err) {
            console.error('Evergreen purchase email error:', err)
          }

          console.log(`Evergreen payment succeeded: registration=${registrationId}`)
          break
        }

        const clerkUserId = session.metadata?.clerk_user_id
        const plan = session.metadata?.plan as 'starter' | 'pro' | undefined

        if (!clerkUserId || !plan) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('clerk_user_id', clerkUserId)

        if (updateError) {
          console.error('Failed to update user after checkout:', updateError)
        } else {
          // Send plan change email
          const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('clerk_user_id', clerkUserId)
            .single()
          if (userData?.email) {
            sendPlanChanged(userData.email, { oldPlan: 'free', newPlan: plan })
          }
        }

        console.log(
          `Checkout completed: user=${clerkUserId}, plan=${plan}`
        )
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id

        if (!priceId) {
          console.error('No price ID found in subscription:', subscription.id)
          break
        }

        const plan = getPlanFromPriceId(priceId)

        // Get current plan before update for email notification
        const { data: currentUser } = await supabase
          .from('users')
          .select('email, plan')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        const { error: updateError } = await supabase
          .from('users')
          .update({ plan })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to update user plan on subscription update:', updateError)
        } else if (currentUser?.email && currentUser.plan !== plan) {
          sendPlanChanged(currentUser.email, { oldPlan: currentUser.plan, newPlan: plan })
        }

        console.log(
          `Subscription updated: subscription=${subscription.id}, plan=${plan}`
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Get user email before resetting plan
        const { data: deletedUser } = await supabase
          .from('users')
          .select('email, plan')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        const { error: updateError } = await supabase
          .from('users')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to reset user plan on subscription deletion:', updateError)
        } else if (deletedUser?.email) {
          sendPlanChanged(deletedUser.email, { oldPlan: deletedUser.plan, newPlan: 'free' })
        }

        console.log(
          `Subscription deleted: subscription=${subscription.id}, reset to free`
        )
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(
          `Invoice payment succeeded: invoice=${invoice.id}, customer=${invoice.customer}`
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn(
          `Invoice payment failed: invoice=${invoice.id}, customer=${invoice.customer}`
        )
        break
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`)
      }
    }
  } catch (error) {
    console.error('Error processing webhook event:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEvergreenPurchaseEmail(supabase: any, registrationId: string, campaignId: string) {
  const { data: registration } = await supabase
    .from('registrations')
    .select('name, email')
    .eq('id', registrationId)
    .single()

  if (!registration) return

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name')
    .eq('id', campaignId)
    .single()

  const { Resend } = await import('resend')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@heartline-inc.com'

  await resend.emails.send({
    from: fromEmail,
    to: registration.email,
    subject: `【購入完了】${campaign?.name || 'お申し込み'}ありがとうございます`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${registration.name}様</h2>
        <p>この度は${campaign?.name || 'コンテンツ'}をご購入いただき、誠にありがとうございます。</p>
        <p>お支払いが正常に完了しました。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #666; font-size: 14px;">
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
      </div>
    `,
  })
}
