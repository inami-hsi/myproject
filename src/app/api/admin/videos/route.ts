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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Video API error:', err)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
}
