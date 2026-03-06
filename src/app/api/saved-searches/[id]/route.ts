import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  search_params: z
    .object({
      industries: z.array(z.string()).optional(),
      prefectures: z.array(z.string()).optional(),
      cities: z.array(z.string()).optional(),
      capital_min: z.number().nonnegative().optional(),
      capital_max: z.number().nonnegative().optional(),
      employee_min: z.number().int().nonnegative().optional(),
      employee_max: z.number().int().nonnegative().optional(),
      keyword: z.string().optional(),
      has_website: z.boolean().optional(),
      status: z.enum(['active', 'closed', 'merged']).optional(),
      sort_by: z.enum(['name', 'capital', 'employee_count', 'updated_at']).optional(),
      sort_order: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
  result_count: z.number().int().nonnegative().nullable().optional(),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getInternalUserId(clerkUserId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error || !user) return null
  return { userId: user.id, supabase }
}

// ---------------------------------------------------------------------------
// GET /api/saved-searches/[id]
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
    const result = await getInternalUserId(clerkUserId)
    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { userId, supabase } = result

    const { data: search, error } = await supabase
      .from('saved_searches')
      .select('id, name, search_params, result_count, notify_enabled, notify_frequency, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !search) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    return NextResponse.json({ saved_search: search })
  } catch (error) {
    console.error('Get saved search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// PUT /api/saved-searches/[id]
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
    const parsed = updateSavedSearchSchema.safeParse(body)
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
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    // Build update payload
    const updateData: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name
    }
    if (parsed.data.search_params !== undefined) {
      updateData.search_params = parsed.data.search_params as unknown as Json
    }
    if (parsed.data.result_count !== undefined) {
      updateData.result_count = parsed.data.result_count
    }

    const { data: updated, error: updateError } = await supabase
      .from('saved_searches')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, name, search_params, result_count, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Saved search update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update saved search' },
        { status: 500 },
      )
    }

    return NextResponse.json({ saved_search: updated })
  } catch (error) {
    console.error('Update saved search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/saved-searches/[id]
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

    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Saved search delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete saved search' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete saved search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
