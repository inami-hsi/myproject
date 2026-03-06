import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// GET /api/notifications — List user's recent notifications
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Get internal user id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch recent 20 notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, type, title, message, saved_search_id, new_count, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (notifError) {
      console.error('Notifications query error:', notifError)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 },
      )
    }

    // Count unread
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (countError) {
      console.error('Unread count error:', countError)
    }

    return NextResponse.json({
      notifications: notifications ?? [],
      unread_count: unreadCount ?? 0,
    })
  } catch (error) {
    console.error('Notifications endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// PUT /api/notifications — Mark notification(s) as read
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_id, mark_all } = body as {
      notification_id?: string
      mark_all?: boolean
    }

    if (!notification_id && !mark_all) {
      return NextResponse.json(
        { error: 'Either notification_id or mark_all is required' },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // Get internal user id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (mark_all) {
      // Mark all as read
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) {
        console.error('Mark all read error:', updateError)
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 },
        )
      }
    } else if (notification_id) {
      // Mark single notification as read
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Mark read error:', updateError)
        return NextResponse.json(
          { error: 'Failed to mark notification as read' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
