import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { uploadVideo, uploadThumbnail } from '@/lib/evergreen/storage'

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

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const videoFile = formData.get('video') as File | null
    const thumbnailFile = formData.get('thumbnail') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null

    if (!videoFile || !title) {
      return NextResponse.json(
        { error: '動画ファイルとタイトルは必須です' },
        { status: 400 }
      )
    }

    // Validate file size (500MB max)
    if (videoFile.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: '動画ファイルは500MB以下にしてください' },
        { status: 400 }
      )
    }

    // Upload video
    const { path: storagePath, error: uploadError } = await uploadVideo(videoFile)
    if (uploadError) {
      return NextResponse.json(
        { error: `アップロードエラー: ${uploadError}` },
        { status: 500 }
      )
    }

    // Upload thumbnail if provided
    let thumbnailUrl: string | null = null
    if (thumbnailFile) {
      const { url, error: thumbError } = await uploadThumbnail(thumbnailFile)
      if (!thumbError) {
        thumbnailUrl = url
      }
    }

    // Create video record
    const supabase = createServiceRoleClient()
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        title,
        description,
        storage_url: storagePath,
        thumbnail_url: thumbnailUrl,
        is_public: false,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(video, { status: 201 })
  } catch (err) {
    console.error('Video upload error:', err)
    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    )
  }
}
