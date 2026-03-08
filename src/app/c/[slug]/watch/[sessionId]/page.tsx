import { notFound } from 'next/navigation'
import { getWatchPageData } from '@/lib/evergreen/queries'
import { WatchContent } from './watch-content'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string; sessionId: string }>
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: 'セッション視聴',
  robots: 'noindex, nofollow',
}

export default async function WatchPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) notFound()

  const data = await getWatchPageData(token)
  if (!data) notFound()

  const { registration, session, campaign, video } = data

  return (
    <div className="min-h-dvh bg-eg-bg-light font-eg-body">
      <WatchContent
        registration={registration}
        session={session}
        campaign={campaign}
        video={video}
      />
    </div>
  )
}
