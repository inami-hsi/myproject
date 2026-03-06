import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/download/{id}
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const supabase = await createServerSupabaseClient()

    // Get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Look up download log
    const { data: downloadLog, error: logError } = await supabase
      .from('download_logs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (logError || !downloadLog) {
      return NextResponse.json(
        { error: 'Download not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      download_id: downloadLog.id,
      status: downloadLog.status,
      record_count: downloadLog.record_count,
      format: downloadLog.format,
      file_url: downloadLog.file_url,
      created_at: downloadLog.created_at,
    })
  } catch (error) {
    console.error('Download status endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
