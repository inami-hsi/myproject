import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { canDownload, getRemainingDownloads, getPlanLimits } from '@/lib/plan-limits'
import { rateLimit } from '@/lib/rate-limit'
import type { Json } from '@/types/database'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const ALLOWED_COLUMNS = [
  'corporate_number',
  'name',
  'name_kana',
  'prefecture_name',
  'city_name',
  'full_address',
  'representative_name',
  'capital',
  'employee_count',
  'website_url',
  'business_summary',
  'establishment_date',
  'corporate_type',
  'status',
] as const

type AllowedColumn = (typeof ALLOWED_COLUMNS)[number]

const downloadSchema = z.object({
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
  }),
  format: z.literal('csv'),
  encoding: z.enum(['utf8', 'sjis']).default('utf8'),
  columns: z
    .array(z.enum(ALLOWED_COLUMNS))
    .min(1)
    .default(['name', 'full_address', 'representative_name', 'capital', 'employee_count', 'website_url', 'business_summary']),
})

// ---------------------------------------------------------------------------
// Column label mapping (Japanese headers)
// ---------------------------------------------------------------------------

const COLUMN_LABELS: Record<AllowedColumn, string> = {
  corporate_number: '法人番号',
  name: '企業名',
  name_kana: '企業名カナ',
  prefecture_name: '都道府県',
  city_name: '市区町村',
  full_address: '住所',
  representative_name: '代表者名',
  capital: '資本金',
  employee_count: '従業員数',
  website_url: 'WebサイトURL',
  business_summary: '事業概要',
  establishment_date: '設立日',
  corporate_type: '法人種別',
  status: 'ステータス',
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Quote if the field contains commas, double quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(
  rows: Record<string, unknown>[],
  columns: AllowedColumn[],
): string {
  const header = columns.map((col) => escapeCSVField(COLUMN_LABELS[col])).join(',')
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCSVField(row[col] as string | number | null)).join(','),
  )
  // UTF-8 BOM for Excel compatibility
  return '\uFEFF' + header + '\n' + dataRows.join('\n')
}

// ---------------------------------------------------------------------------
// Max sync download threshold
// ---------------------------------------------------------------------------

const MAX_SYNC_RECORDS = 5000

// ---------------------------------------------------------------------------
// POST /api/download
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 10 requests per minute per user
    const rl = rateLimit(clerkUserId, 10, 60_000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Parse & validate body
    const body = await request.json()
    const parsed = downloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { search_params: searchParams, columns } = parsed.data

    const supabase = await createServerSupabaseClient()

    // ----- Get current user from users table -----
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ----- Count matching records first -----
    const recordCount = await countMatchingRecords(supabase, searchParams)

    // ----- Check plan limits -----
    const plan = user.plan
    if (!canDownload(plan, user.monthly_download_count, recordCount)) {
      const limits = getPlanLimits(plan)
      return NextResponse.json(
        {
          error: {
            code: 'DOWNLOAD_LIMIT_EXCEEDED',
            message: `月間ダウンロード上限（${limits.monthlyDownloadRecords.toLocaleString()}件）を超えます。プランをアップグレードしてください。`,
            limit: limits.monthlyDownloadRecords,
            used: user.monthly_download_count,
            requested: recordCount,
            plan,
          },
        },
        { status: 403 },
      )
    }

    // ----- Async threshold check -----
    if (recordCount > MAX_SYNC_RECORDS) {
      // Log as pending
      const { data: log } = await supabase
        .from('download_logs')
        .insert({
          user_id: user.id,
          search_params: searchParams as unknown as Json,
          format: 'csv',
          encoding: 'utf8',
          record_count: recordCount,
          status: 'pending',
        })
        .select('id')
        .single()

      return NextResponse.json(
        {
          download_id: log?.id ?? null,
          status: 'pending',
          record_count: recordCount,
          message: `レコード数が${MAX_SYNC_RECORDS.toLocaleString()}件を超えるため、非同期処理が必要です（未実装）。`,
        },
        { status: 202 },
      )
    }

    // ----- Fetch all records for CSV -----
    const rows = await fetchAllRecords(supabase, searchParams, columns)

    // ----- Generate CSV -----
    const csv = generateCSV(rows, columns)

    // ----- Record in download_logs -----
    const { data: downloadLog } = await supabase
      .from('download_logs')
      .insert({
        user_id: user.id,
        search_params: searchParams as unknown as Json,
        format: 'csv',
        encoding: 'utf8',
        record_count: rows.length,
        status: 'completed',
      })
      .select('id')
      .single()

    // ----- Update monthly_download_count -----
    await supabase
      .from('users')
      .update({
        monthly_download_count: user.monthly_download_count + rows.length,
      })
      .eq('id', user.id)

    const remaining = getRemainingDownloads(plan, user.monthly_download_count + rows.length)

    // ----- Return CSV file -----
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `companies_${timestamp}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Download-Id': downloadLog?.id ?? '',
        'X-Record-Count': String(rows.length),
        'X-Remaining-Downloads': String(remaining),
      },
    })
  } catch (error) {
    console.error('Download endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Helpers: count matching records
// ---------------------------------------------------------------------------

async function countMatchingRecords(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  searchParams: z.infer<typeof downloadSchema>['search_params'],
): Promise<number> {
  let query = supabase
    .from('companies')
    .select('id', { count: 'estimated', head: true })

  if (searchParams.prefectures && searchParams.prefectures.length > 0) {
    query = query.in('prefecture_code', searchParams.prefectures)
  }
  if (searchParams.cities && searchParams.cities.length > 0) {
    query = query.in('city_code', searchParams.cities)
  }
  if (searchParams.capital_min !== undefined) {
    query = query.gte('capital', searchParams.capital_min)
  }
  if (searchParams.capital_max !== undefined) {
    query = query.lte('capital', searchParams.capital_max)
  }
  if (searchParams.employee_min !== undefined) {
    query = query.gte('employee_count', searchParams.employee_min)
  }
  if (searchParams.employee_max !== undefined) {
    query = query.lte('employee_count', searchParams.employee_max)
  }
  if (searchParams.keyword) {
    query = query.textSearch('search_vector', searchParams.keyword, { type: 'websearch' })
  }
  if (searchParams.has_website === true) {
    query = query.not('website_url', 'is', null)
  } else if (searchParams.has_website === false) {
    query = query.is('website_url', null)
  }
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  const { count } = await query
  return count ?? 0
}

// ---------------------------------------------------------------------------
// Helpers: fetch all records (paginated internally via range)
// ---------------------------------------------------------------------------

async function fetchAllRecords(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  searchParams: z.infer<typeof downloadSchema>['search_params'],
  columns: AllowedColumn[],
): Promise<Record<string, unknown>[]> {
  // Build Supabase select columns from the requested CSV columns
  // Always include 'id' for industry post-filtering
  const selectCols = new Set<string>(columns)
  selectCols.add('id')
  // prefecture_code is needed for prefecture filter but may not be in download columns
  if (searchParams.prefectures && searchParams.prefectures.length > 0) {
    selectCols.add('prefecture_code')
  }

  const needsIndustryFilter =
    searchParams.industries && searchParams.industries.length > 0

  const PAGE_SIZE = 1000
  const allRows: Record<string, unknown>[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    let query = supabase
      .from('companies')
      .select(Array.from(selectCols).join(','))

    // Apply filters
    if (searchParams.prefectures && searchParams.prefectures.length > 0) {
      query = query.in('prefecture_code', searchParams.prefectures)
    }
    if (searchParams.cities && searchParams.cities.length > 0) {
      query = query.in('city_code', searchParams.cities)
    }
    if (searchParams.capital_min !== undefined) {
      query = query.gte('capital', searchParams.capital_min)
    }
    if (searchParams.capital_max !== undefined) {
      query = query.lte('capital', searchParams.capital_max)
    }
    if (searchParams.employee_min !== undefined) {
      query = query.gte('employee_count', searchParams.employee_min)
    }
    if (searchParams.employee_max !== undefined) {
      query = query.lte('employee_count', searchParams.employee_max)
    }
    if (searchParams.keyword) {
      query = query.textSearch('search_vector', searchParams.keyword, { type: 'websearch' })
    }
    if (searchParams.has_website === true) {
      query = query.not('website_url', 'is', null)
    } else if (searchParams.has_website === false) {
      query = query.is('website_url', null)
    }
    if (searchParams.status) {
      query = query.eq('status', searchParams.status)
    }

    query = query.order('id', { ascending: true }).range(offset, offset + PAGE_SIZE - 1)

    const { data: rows, error } = await query

    if (error) {
      console.error('Download fetch error:', error)
      break
    }

    if (!rows || rows.length === 0) {
      break
    }

    // Industry post-filter if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filtered = rows as any as Record<string, unknown>[]
    if (needsIndustryFilter && filtered.length > 0) {
      const companyIds = filtered.map((r) => r.id as string)
      const industryConditions = searchParams.industries!
        .map((code) => `jsic_code.like.${code}%`)
        .join(',')

      const { data: mappings } = await supabase
        .from('company_industry_mapping')
        .select('company_id')
        .in('company_id', companyIds)
        .or(industryConditions)

      const matchingIds = new Set((mappings ?? []).map((m) => m.company_id))
      filtered = filtered.filter((r) => matchingIds.has(r.id as string))
    }

    allRows.push(...filtered)
    offset += PAGE_SIZE
    hasMore = rows.length === PAGE_SIZE
  }

  return allRows
}
