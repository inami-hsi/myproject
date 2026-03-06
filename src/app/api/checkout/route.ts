import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getStripe, PRICE_IDS } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan } = body as { plan: 'starter' | 'pro' }

    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "starter" or "pro".' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_user_id, stripe_customer_id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const priceId = PRICE_IDS[plan]

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancel`,
      metadata: {
        clerk_user_id: clerkUserId,
        plan,
      },
    }

    if (user.stripe_customer_id) {
      sessionParams.customer = user.stripe_customer_id
    }

    const session = await getStripe().checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
