import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { getUploadPresignedUrl } from '@/lib/evergreen/storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * POST - Two modes:
 * 1. action=presign: Generate presigned URL for direct R2 upload
 * 2. action=register: Register video in DB after upload completes
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'presign') {
      const { filename, contentType } = body
      if (!filename || !contentType) {
        return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 })
      }

      const { url, key, error } = await getUploadPresignedUrl(filename, contentType)
      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ uploadUrl: url, storageKey: key })
    }

    if (action === 'register') {
      const { title, description, storageKey } = body
      if (!title || !storageKey) {
        return NextResponse.json({ error: 'title and storageKey required' }, { status: 400 })
      }

      const supabase = createServiceRoleClient()
      const { data: video, error: dbError } = await supabase
        .from('videos')
        .insert({
          title,
          description: description || null,
          storage_url: storageKey,
          thumbnail_url: null,
          is_public: false,
        })
        .select()
        .single()

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
      }

      return NextResponse.json(video, { status: 201 })
    }

    if (action === 'delete') {
      const { videoId } = body
      if (!videoId) {
        return NextResponse.json({ error: 'videoId required' }, { status: 400 })
      }

      const supabase = createServiceRoleClient()

      // Get video to find storage key
      const { data: video } = await supabase
        .from('videos')
        .select('id, storage_url')
        .eq('id', videoId)
        .single()

      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }

      // Delete from R2
      if (video.storage_url) {
        const { deleteVideo } = await import('@/lib/evergreen/storage')
        await deleteVideo(video.storage_url)
      }

      // Delete from DB
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Video API error:', err)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
}
