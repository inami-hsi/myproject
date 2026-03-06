import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/search/count
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const industries = searchParams.getAll('industries')
    const prefectures = searchParams.getAll('prefectures')
    const cities = searchParams.getAll('cities')
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
