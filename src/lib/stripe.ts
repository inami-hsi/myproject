import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    })
  }
  return _stripe
}

export const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
} as const

export function getPlanFromPriceId(priceId: string): 'starter' | 'pro' | 'free' {
  if (priceId === PRICE_IDS.starter) return 'starter'
  if (priceId === PRICE_IDS.pro) return 'pro'
  return 'free'
}
