import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/search/preview
// ---------------------------------------------------------------------------

const PREVIEW_LIMIT = 5

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

    const supabase = await createServerSupabaseClient()

    // --- Build query ---
    let query = supabase
      .from('companies')
      .select(
        `
        id,
        corporate_number,
        name,
        prefecture_name,
        city_name,
        capital,
        employee_count,
        business_summary,
        updated_at
        `,
        { count: 'estimated' },
      )

    // Prefecture filter
    if (prefectures.length > 0) {
      query = query.in('prefecture_code', prefectures)
    }

    // City filter
    if (cities.length > 0) {
      query = query.in('city_code', cities)
    }

    // Capital range
    if (capitalMin) {
      query = query.gte('capital', Number(capitalMin))
    }
    if (capitalMax) {
      query = query.lte('capital', Number(capitalMax))
    }

    // Employee range
    if (employeeMin) {
      query = query.gte('employee_count', Number(employeeMin))
    }
    if (employeeMax) {
      query = query.lte('employee_count', Number(employeeMax))
    }

    // Keyword full-text search
    if (keyword) {
      query = query.textSearch('search_vector', keyword, {
        type: 'websearch',
      })
    }

    // Website filter
    if (hasWebsite === 'true') {
      query = query.not('website_url', 'is', null)
    } else if (hasWebsite === 'false') {
      query = query.is('website_url', null)
    }

    // Status filter
    if (status && ['active', 'closed', 'merged'].includes(status)) {
      query = query.eq('status', status as 'active' | 'closed' | 'merged')
    }

    // Sort and limit
    query = query
      .order('updated_at', { ascending: false })
      .limit(PREVIEW_LIMIT)

    const { data: rows, error, count } = await query

    if (error) {
      console.error('Preview query error:', error)
      return NextResponse.json(
        { error: 'Failed to execute preview query' },
        { status: 500 },
      )
    }

    let filteredRows = rows ?? []

    // --- Industry post-filter ---
    if (industries.length > 0 && filteredRows.length > 0) {
      const companyIds = filteredRows.map((r) => r.id)

      const industryConditions = industries
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

    // --- Fetch industry names ---
    let industryMap: Record<string, string[]> = {}

    if (filteredRows.length > 0) {
      const resultIds = filteredRows.map((r) => r.id)

      const { data: industryData } = await supabase
        .from('company_industry_mapping')
        .select('company_id, jsic_code')
        .in('company_id', resultIds)

      if (industryData && industryData.length > 0) {
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

    // --- Build response with masked fields ---
    const companies = filteredRows.map((row) => ({
      id: row.id,
      corporate_number: row.corporate_number,
      name: row.name,
      prefecture_name: row.prefecture_name,
      city_name: row.city_name,
      representative_name: null, // Masked for preview
      capital: row.capital,
      employee_count: row.employee_count,
      industry_names: industryMap[row.id] ?? [],
      business_summary: row.business_summary,
      website_url: null, // Masked for preview
      updated_at: row.updated_at,
    }))

    return NextResponse.json({
      total_count_approx: count ?? 0,
      companies,
      next_cursor: null,
      has_more: false,
    })
  } catch (error) {
    console.error('Preview endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
