import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Basic fields (available to all plans)
// ---------------------------------------------------------------------------

const BASIC_FIELDS = [
  'id',
  'corporate_number',
  'name',
  'name_kana',
  'prefecture_name',
  'city_name',
  'status',
  'corporate_type',
] as const

// ---------------------------------------------------------------------------
// Full fields (available to starter + pro)
// ---------------------------------------------------------------------------

const FULL_FIELDS = [
  ...BASIC_FIELDS,
  'postal_code',
  'address',
  'full_address',
  'representative_name',
  'capital',
  'employee_count',
  'business_summary',
  'gbiz_business_items',
  'website_url',
  'establishment_date',
  'gbizinfo_updated_at',
  'nta_updated_at',
  'created_at',
  'updated_at',
] as const

// ---------------------------------------------------------------------------
// GET /api/companies/[id]
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
    const supabase = createServiceRoleClient()

    // Get user + plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const limits = getPlanLimits(user.plan)
    const isFull = limits.detailAccess === 'full'
    const selectFields = isFull ? FULL_FIELDS.join(',') : BASIC_FIELDS.join(',')

    // Fetch company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(selectFields)
      .eq('id', id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Fetch industry mappings + names
    const { data: mappings } = await supabase
      .from('company_industry_mapping')
      .select('jsic_code, source, confidence')
      .eq('company_id', id)

    let industries: Array<{ code: string; name: string; source: string; confidence: number }> = []

    if (mappings && mappings.length > 0) {
      const jsicCodes = mappings.map((m) => m.jsic_code)

      const { data: classifications } = await supabase
        .from('industry_classifications')
        .select('code, name, level')
        .in('code', jsicCodes)

      const codeToName: Record<string, string> = {}
      if (classifications) {
        for (const c of classifications) {
          codeToName[c.code] = c.name
        }
      }

      industries = mappings.map((m) => ({
        code: m.jsic_code,
        name: codeToName[m.jsic_code] ?? m.jsic_code,
        source: m.source,
        confidence: m.confidence,
      }))
    }

    return NextResponse.json({
      company: Object.assign({}, company, { industries }),
      access_level: limits.detailAccess,
    })
  } catch (error) {
    console.error('Company detail endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
