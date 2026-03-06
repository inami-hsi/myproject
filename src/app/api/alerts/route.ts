import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createAlertSchema = z.object({
  saved_search_id: z.string().uuid(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
})

// ---------------------------------------------------------------------------
// GET /api/alerts — List user's alerts
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

    // Fetch saved searches that are alerts
    const { data: alerts, error: alertError } = await supabase
      .from('saved_searches')
      .select('id, name, search_params, result_count, notify_enabled, notify_frequency, last_notified_at, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('notify_enabled', true)
      .order('created_at', { ascending: false })

    if (alertError) {
      console.error('Alerts query error:', alertError)
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 },
      )
    }

    return NextResponse.json({ alerts: alerts ?? [] })
  } catch (error) {
    console.error('Alerts endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/alerts — Enable alert on a saved search
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createAlertSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
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

    // Verify ownership of saved search
    const { data: search, error: searchError } = await supabase
      .from('saved_searches')
      .select('id')
      .eq('id', parsed.data.saved_search_id)
      .eq('user_id', user.id)
      .single()

    if (searchError || !search) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 },
      )
    }

    // Enable alert
    const { data: updated, error: updateError } = await supabase
      .from('saved_searches')
      .update({
        notify_enabled: true,
        notify_frequency: parsed.data.frequency,
      })
      .eq('id', parsed.data.saved_search_id)
      .eq('user_id', user.id)
      .select('id, name, search_params, result_count, notify_enabled, notify_frequency, last_notified_at, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Alert enable error:', updateError)
      return NextResponse.json(
        { error: 'Failed to enable alert' },
        { status: 500 },
      )
    }

    return NextResponse.json({ alert: updated }, { status: 201 })
  } catch (error) {
    console.error('Alert create endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
