import { notFound } from 'next/navigation'
import { getWatchPageData } from '@/lib/evergreen/queries'
import { CountdownTimer } from '@/components/evergreen/countdown-timer'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: '登録完了',
}

export default async function ThanksPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) notFound()

  const data = await getWatchPageData(token)
  if (!data) notFound()

  const { registration, session } = data

  const sessionDate = new Date(session.starts_at).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-eg-bg-light px-4 py-16 font-eg-body">
      <div className="mx-auto max-w-lg text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-eg-success/10">
          <svg className="h-10 w-10 text-eg-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-eg-display text-3xl font-bold text-eg-primary sm:text-4xl">
          ご登録ありがとうございます！
        </h1>

        <p className="mt-4 text-lg text-eg-text-secondary">
          {registration.name}様、セッションへの登録が完了しました。
        </p>

        {/* Session Info Card */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="font-eg-heading text-sm font-medium uppercase tracking-wider text-eg-text-secondary">
            セッション日時
          </p>
          <p className="mt-2 font-eg-heading text-xl font-semibold text-eg-primary">
            {sessionDate}
          </p>

          <div className="my-6 border-t border-gray-100" />

          <p className="font-eg-heading text-sm font-medium text-eg-text-secondary">
            セッション開始まで
          </p>
          <div className="mt-3">
            <CountdownTimer targetDate={session.starts_at} size="sm" />
          </div>
        </div>

        {/* Watch Link */}
        <div className="mt-8">
          <a
            href={`/c/${slug}/watch/${session.id}?token=${token}`}
            className="inline-block rounded-lg bg-eg-accent px-8 py-4 font-eg-heading text-lg font-bold text-white
              shadow-md transition-all duration-200 hover:bg-eg-accent/90 hover:shadow-lg"
          >
            視聴ページをブックマーク
          </a>
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-left">
          <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">
            次のステップ
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              '確認メールをご確認ください（数分以内に届きます）',
              'セッション開始前にリマインダーメールをお送りします',
              'セッション開始時刻に上記リンクからアクセスしてください',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-eg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-eg-text-primary">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
