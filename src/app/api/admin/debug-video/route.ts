import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { getVideoSignedUrl } from '@/lib/evergreen/storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, storage_url')
    .limit(5)

  if (!videos || videos.length === 0) {
    return NextResponse.json({ error: 'No videos found' })
  }

  const results = []
  for (const video of videos) {
    let signedUrl: string | null = null
    let error: string | null = null
    try {
      signedUrl = await getVideoSignedUrl(video.storage_url)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
    }

    results.push({
      id: video.id,
      title: video.title,
      storage_url: video.storage_url,
      signed_url: signedUrl,
      error,
    })
  }

  return NextResponse.json({
    r2_bucket: process.env.R2_BUCKET || 'evergreen (default)',
    r2_account_id: process.env.R2_ACCOUNT_ID ? '設定済み' : '未設定',
    r2_access_key: process.env.R2_ACCESS_KEY_ID ? '設定済み' : '未設定',
    r2_secret_key: process.env.R2_SECRET_ACCESS_KEY ? '設定済み' : '未設定',
    videos: results,
  })
}
