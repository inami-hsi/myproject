import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

const checkoutSchema = z.object({
  registration_id: z.string().uuid(),
  token: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = checkoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { registration_id, token } = parsed.data
  const supabase = createServiceRoleClient()

  // Verify registration and get campaign info
  const { data: registration } = await supabase
    .from('registrations')
    .select('id, name, email, campaign_id, token')
    .eq('id', registration_id)
    .eq('token', token)
    .single()

  if (!registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, slug, offer_price, offer_currency')
    .eq('id', registration.campaign_id)
    .single()

  if (!campaign || !campaign.offer_price) {
    return NextResponse.json({ error: 'No offer available' }, { status: 400 })
  }

  // Check for existing successful payment
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('registration_id', registration_id)
    .eq('status', 'succeeded')
    .limit(1)
    .single()

  if (existingPayment) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: registration.email,
    line_items: [
      {
        price_data: {
          currency: campaign.offer_currency || 'jpy',
          product_data: {
            name: campaign.name,
          },
          unit_amount: campaign.offer_price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      registration_id: registration.id,
      campaign_id: campaign.id,
      type: 'evergreen_offer',
    },
    success_url: `${appUrl}/c/${campaign.slug}/thanks-purchase?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/c/${campaign.slug}/watch/${registration.id}?token=${token}`,
  })

  // Create pending payment record
  await supabase.from('payments').insert({
    registration_id: registration.id,
    stripe_payment_id: session.id,
    amount: campaign.offer_price,
    currency: campaign.offer_currency || 'jpy',
    status: 'pending',
  })

  return NextResponse.json({ checkout_url: session.url })
}
