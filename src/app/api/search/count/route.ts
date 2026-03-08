import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// GET /api/search/count
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 60 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const rl = rateLimit(`count:${ip}`, 60, 60_000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const { searchParams } = new URL(request.url)

    // Support both comma-separated and repeated params
    const parseArray = (key: string): string[] => {
      const values = searchParams.getAll(key)
      return values.flatMap((v) => v.split(',').map((s) => s.trim())).filter(Boolean)
    }

    const industries = parseArray('industries')
    const prefectures = parseArray('prefectures')
    const cities = parseArray('cities')
    const capitalMin = searchParams.get('capital_min')
    const capitalMax = searchParams.get('capital_max')
    const employeeMin = searchParams.get('employee_min')
    const employeeMax = searchParams.get('employee_max')
    const keyword = searchParams.get('keyword')
    const hasWebsite = searchParams.get('has_website')
    const status = searchParams.get('status')

    const supabase = createServiceRoleClient()

    // --- Fast path: use materialized view for simple prefecture + industry ---
    const isSimpleFilter =
      !cities.length &&
      !capitalMin &&
      !capitalMax &&
      !employeeMin &&
      !employeeMax &&
      !keyword &&
      hasWebsite === null &&
      !status

    if (isSimpleFilter && (prefectures.length > 0 || industries.length > 0)) {
      let mvQuery = supabase
        .from('mv_prefecture_industry_count')
        .select('company_count')

      if (prefectures.length > 0) {
        mvQuery = mvQuery.in('prefecture_code', prefectures)
      }

      if (industries.length > 0) {
        // Build OR conditions for JSIC code prefix matching
        const industryConditions = industries
          .map((code) => `jsic_code.like.${code}%`)
          .join(',')
        mvQuery = mvQuery.or(industryConditions)
      }

      const { data: mvData, error: mvError } = await mvQuery

      if (!mvError && mvData) {
        // Sum up company counts from matching rows.
        // Note: when both prefecture and industry filters are active, each row
        // represents a unique (prefecture, industry) combination, so the sum
        // gives us the aggregate count.
        const totalCount = mvData.reduce(
          (sum, row) => sum + (row.company_count ?? 0),
          0,
        )

        return NextResponse.json({
          total_count_approx: totalCount,
          source: 'materialized_view' as const,
        })
      }
      // Fall through to estimate if MV query fails
    }

    // --- Fallback: count estimate from companies table ---

    // Pre-filter by industry if needed
    if (industries.length > 0) {
      const industryConditions = industries
        .map((code) => `jsic_code.like.${code}%`)
        .join(',')

      const { data: mappings, error: mappingError } = await supabase
        .from('company_industry_mapping')
        .select('company_id')
        .or(industryConditions)

      if (mappingError) {
        console.error('Industry count filter error:', mappingError)
        return NextResponse.json(
          { error: 'Failed to filter by industry' },
          { status: 500 },
        )
      }

      const companyIds = Array.from(new Set((mappings ?? []).map((m) => m.company_id)))

      if (companyIds.length === 0) {
        return NextResponse.json({
          total_count_approx: 0,
          source: 'estimate' as const,
        })
      }

      let query = supabase
        .from('companies')
        .select('id', { count: 'estimated', head: true })
        .in('id', companyIds)

      if (prefectures.length > 0) {
        query = query.in('prefecture_code', prefectures)
      }
      if (cities.length > 0) {
        query = query.in('city_code', cities)
      }
      if (capitalMin) query = query.gte('capital', Number(capitalMin))
      if (capitalMax) query = query.lte('capital', Number(capitalMax))
      if (employeeMin) query = query.gte('employee_count', Number(employeeMin))
      if (employeeMax) query = query.lte('employee_count', Number(employeeMax))
      if (keyword) {
        query = query.textSearch('search_vector', keyword, { type: 'websearch' })
      }
      if (hasWebsite === 'true') query = query.not('website_url', 'is', null)
      else if (hasWebsite === 'false') query = query.is('website_url', null)
      if (status && ['active', 'closed', 'merged'].includes(status)) {
        query = query.eq('status', status as 'active' | 'closed' | 'merged')
      }

      const { count, error } = await query
      if (error) {
        console.error('Count query error:', error)
        return NextResponse.json(
          { error: 'Failed to execute count query' },
          { status: 500 },
        )
      }

      return NextResponse.json({
        total_count_approx: count ?? 0,
        source: 'estimate' as const,
      })
    }

    let query = supabase
      .from('companies')
      .select('id', { count: 'estimated', head: true })

    if (prefectures.length > 0) {
      query = query.in('prefecture_code', prefectures)
    }

    if (cities.length > 0) {
      query = query.in('city_code', cities)
    }

    if (capitalMin) {
      query = query.gte('capital', Number(capitalMin))
    }
    if (capitalMax) {
      query = query.lte('capital', Number(capitalMax))
    }

    if (employeeMin) {
      query = query.gte('employee_count', Number(employeeMin))
    }
    if (employeeMax) {
      query = query.lte('employee_count', Number(employeeMax))
    }

    if (keyword) {
      query = query.textSearch('search_vector', keyword, {
        type: 'websearch',
      })
    }

    if (hasWebsite === 'true') {
      query = query.not('website_url', 'is', null)
    } else if (hasWebsite === 'false') {
      query = query.is('website_url', null)
    }

    if (status && ['active', 'closed', 'merged'].includes(status)) {
      query = query.eq('status', status as 'active' | 'closed' | 'merged')
    }

    const { count, error } = await query

    if (error) {
      console.error('Count query error:', error)
      return NextResponse.json(
        { error: 'Failed to execute count query' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      total_count_approx: count ?? 0,
      source: 'estimate' as const,
    })
  } catch (error) {
    console.error('Count endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
