import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndustryStat {
  code: string
  name: string
  company_count: number
  percentage: number
}

// ---------------------------------------------------------------------------
// GET /api/stats/industries
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Query the mv_industry_summary materialized view
    const { data, error } = await supabase
      .from('mv_industry_summary')
      .select('major_code, major_name, company_count')
      .order('company_count', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[stats/industries] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch industry statistics' },
        { status: 500 },
      )
    }

    const rows = data ?? []
    const total = rows.reduce((sum, r) => sum + (r.company_count ?? 0), 0)

    const industries: IndustryStat[] = rows.map((row) => ({
      code: row.major_code,
      name: row.major_name,
      company_count: row.company_count ?? 0,
      percentage: total > 0 ? Math.round(((row.company_count ?? 0) / total) * 1000) / 10 : 0,
    }))

    return NextResponse.json({
      industries,
      total,
    })
  } catch (error) {
    console.error('[stats/industries] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
