import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getStripe, getPlanFromPriceId } from '@/lib/stripe'
import type Stripe from 'stripe'

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

        const { error: updateError } = await supabase
          .from('users')
          .update({ plan })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to update user plan on subscription update:', updateError)
        }

        console.log(
          `Subscription updated: subscription=${subscription.id}, plan=${plan}`
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error: updateError } = await supabase
          .from('users')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to reset user plan on subscription deletion:', updateError)
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
