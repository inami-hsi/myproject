import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const updateAlertSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  notify_enabled: z.boolean().optional(),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getInternalUserId(clerkUserId: string) {
  const supabase = createServiceRoleClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error || !user) return null
  return { userId: user.id, supabase }
}

// ---------------------------------------------------------------------------
// PUT /api/alerts/[id] — Update alert frequency
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateAlertSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const result = await getInternalUserId(clerkUserId)
    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { userId, supabase } = result

    // Verify ownership
    const { data: existing, error: existError } = await supabase
      .from('saved_searches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (existError || !existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Build update
    const updateData: Record<string, unknown> = {}
    if (parsed.data.frequency !== undefined) {
      updateData.notify_frequency = parsed.data.frequency
    }
    if (parsed.data.notify_enabled !== undefined) {
      updateData.notify_enabled = parsed.data.notify_enabled
    }

    const { data: updated, error: updateError } = await supabase
      .from('saved_searches')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, name, search_params, result_count, notify_enabled, notify_frequency, last_notified_at, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Alert update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 },
      )
    }

    return NextResponse.json({ alert: updated })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/alerts/[id] — Disable alert (sets notify_enabled = false)
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await getInternalUserId(clerkUserId)
    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { userId, supabase } = result

    // Disable alert (don't delete the saved search)
    const { error } = await supabase
      .from('saved_searches')
      .update({ notify_enabled: false })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Alert disable error:', error)
      return NextResponse.json(
        { error: 'Failed to disable alert' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
