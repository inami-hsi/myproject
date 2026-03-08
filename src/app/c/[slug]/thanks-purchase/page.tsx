import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function ThanksPurchasePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { session_id } = await searchParams
  const supabase = createServiceRoleClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!campaign) notFound()

  // If we have a session_id, look up the payment
  let paymentStatus: 'succeeded' | 'pending' | 'unknown' = 'unknown'
  if (session_id) {
    const { data: payment } = await supabase
      .from('payments')
      .select('status')
      .eq('stripe_payment_id', session_id)
      .single()

    paymentStatus = (payment?.status as 'succeeded' | 'pending') ?? 'pending'
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-eg-bg-light px-4 py-16 font-eg-body">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-eg-success/10">
          <svg className="h-10 w-10 text-eg-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 font-eg-display text-3xl font-bold text-eg-primary">
          ご購入ありがとうございます
        </h1>

        <p className="mt-4 text-lg text-eg-text-secondary">
          {campaign.name}のお申し込みが完了しました。
        </p>

        {paymentStatus === 'pending' && (
          <p className="mt-2 text-sm text-eg-gold">
            決済の確認中です。まもなく完了します。
          </p>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left">
          <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">次のステップ</h2>
          <ul className="mt-3 space-y-2 text-sm text-eg-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-eg-accent/10 text-center text-xs font-bold leading-5 text-eg-accent">1</span>
              確認メールをお送りしました。メールをご確認ください。
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-eg-accent/10 text-center text-xs font-bold leading-5 text-eg-accent">2</span>
              メールに記載の手順に従って、コンテンツにアクセスしてください。
            </li>
          </ul>
        </div>

        <Link
          href={`/c/${slug}`}
          className="mt-8 inline-block text-sm font-medium text-eg-accent hover:text-eg-accent/80"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
