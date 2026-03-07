import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'
import { rateLimit } from '@/lib/rate-limit'
import type { Json } from '@/types/database'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  search_params: z.object({
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
  }),
  result_count: z.number().int().nonnegative().nullable().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/saved-searches — List user's saved searches
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 30 requests per minute per user
    const rl = rateLimit(clerkUserId, 30, 60_000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
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

    const { data: searches, error: searchError } = await supabase
      .from('saved_searches')
      .select('id, name, search_params, result_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (searchError) {
      console.error('Saved searches query error:', searchError)
      return NextResponse.json(
        { error: 'Failed to fetch saved searches' },
        { status: 500 },
      )
    }

    return NextResponse.json({ saved_searches: searches ?? [] })
  } catch (error) {
    console.error('Saved searches endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/saved-searches — Create new saved search
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 10 requests per minute per user
    const rl = rateLimit(`saved-search-post:${clerkUserId}`, 10, 60_000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Parse & validate body
    const body = await request.json()
    const parsed = createSavedSearchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // Get internal user + plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check plan limits
    const limits = getPlanLimits(user.plan)
    const { count, error: countError } = await supabase
      .from('saved_searches')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Saved search count error:', countError)
      return NextResponse.json(
        { error: 'Failed to check saved search limit' },
        { status: 500 },
      )
    }

    const currentCount = count ?? 0
    if (currentCount >= limits.maxSavedSearches) {
      return NextResponse.json(
        {
          error: {
            code: 'SAVED_SEARCH_LIMIT_EXCEEDED',
            message: `保存検索の上限（${limits.maxSavedSearches === Infinity ? '無制限' : limits.maxSavedSearches}件）に達しています。プランをアップグレードしてください。`,
            limit: limits.maxSavedSearches,
            used: currentCount,
            plan: user.plan,
          },
        },
        { status: 403 },
      )
    }

    // Insert saved search
    const { data: created, error: insertError } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        search_params: parsed.data.search_params as unknown as Json,
        result_count: parsed.data.result_count ?? null,
      })
      .select('id, name, search_params, result_count, created_at')
      .single()

    if (insertError) {
      console.error('Saved search insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create saved search' },
        { status: 500 },
      )
    }

    return NextResponse.json({ saved_search: created }, { status: 201 })
  } catch (error) {
    console.error('Saved search create endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
