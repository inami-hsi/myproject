import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const searchSchema = z.object({
  industries: z.array(z.string().max(10)).max(100).optional(),
  prefectures: z.array(z.string().max(6)).max(47).optional(),
  cities: z.array(z.string().max(10)).max(200).optional(),
  capital_min: z.number().nonnegative().optional(),
  capital_max: z.number().nonnegative().optional(),
  employee_min: z.number().int().nonnegative().optional(),
  employee_max: z.number().int().nonnegative().optional(),
  keyword: z.string().max(200).transform((s) => s.trim()).optional(),
  has_website: z.boolean().optional(),
  status: z.enum(['active', 'closed', 'merged']).optional(),
  sort_by: z.enum(['name', 'capital', 'employee_count', 'updated_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().max(500).nullable().optional(),
})



// ---------------------------------------------------------------------------
// Cursor helpers
// ---------------------------------------------------------------------------

interface CursorPayload {
  id: string
  sort_value: string | number | null
}

function decodeCursor(cursor: string): CursorPayload {
  const json = Buffer.from(cursor, 'base64').toString('utf-8')
  return JSON.parse(json) as CursorPayload
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// ---------------------------------------------------------------------------
// POST /api/search
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 30 requests per minute per user
    const rl = rateLimit(userId, 30, 60_000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Parse & validate body
    const body = await request.json()
    const parsed = searchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const params = parsed.data
    const sortBy = params.sort_by ?? 'updated_at'
    const sortOrder = params.sort_order ?? 'desc'
    const limit = params.limit ?? 50

    const supabase = await createServerSupabaseClient()

    // ----- Build the query -----
    // We need to handle industry filtering via a join, which requires RPC or
    // a manual approach. We use the Supabase query builder with inner joins
    // via the `!inner` modifier when industry filters are present.

    const needsIndustryFilter =
      params.industries && params.industries.length > 0

    // Start with the companies table, selecting the columns we need.
    // When industry filtering is needed we join through company_industry_mapping.
    let query = supabase
      .from('companies')
      .select(
        `
        id,
        corporate_number,
        name,
        prefecture_name,
        city_name,
        representative_name,
        capital,
        employee_count,
        business_summary,
        website_url,
        updated_at
        `,
        { count: 'estimated' },
      )

    // --- Filters ---

    // Prefecture filter
    if (params.prefectures && params.prefectures.length > 0) {
      query = query.in('prefecture_code', params.prefectures)
    }

    // City filter
    if (params.cities && params.cities.length > 0) {
      query = query.in('city_code', params.cities)
    }

    // Capital range
    if (params.capital_min !== undefined) {
      query = query.gte('capital', params.capital_min)
    }
    if (params.capital_max !== undefined) {
      query = query.lte('capital', params.capital_max)
    }

    // Employee range
    if (params.employee_min !== undefined) {
      query = query.gte('employee_count', params.employee_min)
    }
    if (params.employee_max !== undefined) {
      query = query.lte('employee_count', params.employee_max)
    }

    // Keyword full-text search
    if (params.keyword) {
      query = query.textSearch('search_vector', params.keyword, {
        type: 'websearch',
      })
    }

    // Website filter
    if (params.has_website === true) {
      query = query.not('website_url', 'is', null)
    } else if (params.has_website === false) {
      query = query.is('website_url', null)
    }

    // Status filter
    if (params.status) {
      query = query.eq('status', params.status)
    }

    // --- Keyset pagination ---
    if (params.cursor) {
      const cursorData = decodeCursor(params.cursor)
      const ascending = sortOrder === 'asc'

      if (sortBy === 'name') {
        // Composite keyset: (sort_column, id)
        if (ascending) {
          query = query.or(
            `name.gt.${cursorData.sort_value},and(name.eq.${cursorData.sort_value},id.gt.${cursorData.id})`,
          )
        } else {
          query = query.or(
            `name.lt.${cursorData.sort_value},and(name.eq.${cursorData.sort_value},id.lt.${cursorData.id})`,
          )
        }
      } else if (sortBy === 'capital' || sortBy === 'employee_count') {
        // Numeric sort columns – nulls are pushed to the end
        if (ascending) {
          if (cursorData.sort_value === null) {
            // Already in the null zone, just paginate by id
            query = query.is(sortBy, null).gt('id', cursorData.id)
          } else {
            query = query.or(
              `${sortBy}.gt.${cursorData.sort_value},and(${sortBy}.eq.${cursorData.sort_value},id.gt.${cursorData.id}),${sortBy}.is.null`,
            )
          }
        } else {
          if (cursorData.sort_value === null) {
            query = query.is(sortBy, null).lt('id', cursorData.id)
          } else {
            query = query.or(
              `${sortBy}.lt.${cursorData.sort_value},and(${sortBy}.eq.${cursorData.sort_value},id.lt.${cursorData.id})`,
            )
          }
        }
      } else {
        // updated_at (default)
        if (ascending) {
          query = query.or(
            `updated_at.gt.${cursorData.sort_value},and(updated_at.eq.${cursorData.sort_value},id.gt.${cursorData.id})`,
          )
        } else {
          query = query.or(
            `updated_at.lt.${cursorData.sort_value},and(updated_at.eq.${cursorData.sort_value},id.lt.${cursorData.id})`,
          )
        }
      }
    }

    // --- Sort ---
    if (sortBy === 'capital' || sortBy === 'employee_count') {
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: sortOrder !== 'asc' })
        .order('id', { ascending: sortOrder === 'asc' })
    } else {
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .order('id', { ascending: sortOrder === 'asc' })
    }

    // Fetch limit + 1 to detect has_more
    query = query.limit(limit + 1)

    const { data: rows, error, count } = await query

    if (error) {
      console.error('Search query error:', error)
      return NextResponse.json(
        { error: 'Failed to execute search query' },
        { status: 500 },
      )
    }

    // --- Industry post-filter (when industry codes are provided) ---
    // Because Supabase JS client doesn't natively support filtering through
    // a join table with LIKE/startsWith in a single query, we fetch matching
    // company IDs from company_industry_mapping separately and intersect.
    let filteredRows = rows ?? []

    if (needsIndustryFilter && filteredRows.length > 0) {
      const companyIds = filteredRows.map((r) => r.id)

      // Build OR conditions for jsic_code prefix matching
      // e.g. industries=["E", "G39"] -> jsic_code LIKE 'E%' OR jsic_code LIKE 'G39%'
      const industryConditions = params.industries!
        .map((code) => `jsic_code.like.${code}%`)
        .join(',')

      const { data: mappings, error: mappingError } = await supabase
        .from('company_industry_mapping')
        .select('company_id')
        .in('company_id', companyIds)
        .or(industryConditions)

      if (mappingError) {
        console.error('Industry filter error:', mappingError)
        return NextResponse.json(
          { error: 'Failed to filter by industry' },
          { status: 500 },
        )
      }

      const matchingIds = new Set((mappings ?? []).map((m) => m.company_id))
      filteredRows = filteredRows.filter((r) => matchingIds.has(r.id))
    }

    // --- Fetch industry names for result rows ---
    let industryMap: Record<string, string[]> = {}

    if (filteredRows.length > 0) {
      const resultIds = filteredRows.slice(0, limit).map((r) => r.id)

      const { data: industryData } = await supabase
        .from('company_industry_mapping')
        .select('company_id, jsic_code')
        .in('company_id', resultIds)

      if (industryData && industryData.length > 0) {
        // Collect all unique jsic codes
        const jsicCodes = Array.from(new Set(industryData.map((d) => d.jsic_code)))

        const { data: classifications } = await supabase
          .from('industry_classifications')
          .select('code, name')
          .in('code', jsicCodes)

        const codeToName: Record<string, string> = {}
        if (classifications) {
          for (const c of classifications) {
            codeToName[c.code] = c.name
          }
        }

        // Build map: company_id -> industry_names[]
        industryMap = {}
        for (const d of industryData) {
          if (!industryMap[d.company_id]) {
            industryMap[d.company_id] = []
          }
          const name = codeToName[d.jsic_code]
          if (name && !industryMap[d.company_id].includes(name)) {
            industryMap[d.company_id].push(name)
          }
        }
      }
    }

    // --- Build response ---
    const hasMore = filteredRows.length > limit
    const resultRows = filteredRows.slice(0, limit)

    let nextCursor: string | null = null
    if (hasMore && resultRows.length > 0) {
      const lastRow = resultRows[resultRows.length - 1]
      const sortValue =
        sortBy === 'name'
          ? lastRow.name
          : sortBy === 'capital'
            ? lastRow.capital
            : sortBy === 'employee_count'
              ? lastRow.employee_count
              : lastRow.updated_at
      nextCursor = encodeCursor({
        id: lastRow.id,
        sort_value: sortValue,
      })
    }

    const companies = resultRows.map((row) => ({
      id: row.id,
      corporate_number: row.corporate_number,
      name: row.name,
      prefecture_name: row.prefecture_name,
      city_name: row.city_name,
      representative_name: row.representative_name,
      capital: row.capital,
      employee_count: row.employee_count,
      industry_names: industryMap[row.id] ?? [],
      business_summary: row.business_summary,
      website_url: row.website_url,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({
      total_count_approx: count ?? 0,
      companies,
      next_cursor: nextCursor,
      has_more: hasMore,
    })
  } catch (error) {
    console.error('Search endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
