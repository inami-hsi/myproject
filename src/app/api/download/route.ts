import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import * as XLSX from 'xlsx'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { canDownload, getRemainingDownloads, getPlanLimits } from '@/lib/plan-limits'
import { rateLimit } from '@/lib/rate-limit'
import { sendDownloadComplete, sendUsageAlert } from '@/lib/email'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

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
  format: z.enum(['csv', 'xlsx']),
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
// XLSX helpers
// ---------------------------------------------------------------------------

function generateXLSX(
  rows: Record<string, unknown>[],
  columns: AllowedColumn[],
): Buffer {
  const headers = columns.map((col) => COLUMN_LABELS[col])
  const data = rows.map((row) =>
    columns.map((col) => {
      const val = row[col]
      if (val === null || val === undefined) return ''
      return val
    }),
  )
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  // Auto-size columns based on header length
  ws['!cols'] = columns.map((col) => ({
    wch: Math.max(COLUMN_LABELS[col].length * 2, 12),
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '企業リスト')
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
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

    const { search_params: searchParams, format, columns } = parsed.data

    const supabase = createServiceRoleClient()

    // ----- Get current user from users table -----
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ----- Check format availability for plan -----
    const planLimits = getPlanLimits(user.plan)
    if (format === 'xlsx' && !(planLimits.downloadFormats as readonly string[]).includes('xlsx')) {
      return NextResponse.json(
        { error: 'Excel形式はStarter/Proプランでご利用いただけます。' },
        { status: 403 },
      )
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
          format,
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

    // ----- Generate file -----
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    let contentType: string
    let filename: string

    let responseBody: BodyInit

    if (format === 'xlsx') {
      const xlsxBuf = generateXLSX(rows, columns)
      responseBody = new Uint8Array(xlsxBuf)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `companies_${timestamp}.xlsx`
    } else {
      responseBody = generateCSV(rows, columns)
      contentType = 'text/csv; charset=utf-8'
      filename = `companies_${timestamp}.csv`
    }

    // ----- Record in download_logs -----
    const { data: downloadLog } = await supabase
      .from('download_logs')
      .insert({
        user_id: user.id,
        search_params: searchParams as unknown as Json,
        format,
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

    const newCount = user.monthly_download_count + rows.length
    const remaining = getRemainingDownloads(plan, newCount)

    // ----- Send email notifications (fire-and-forget) -----
    if (user.email) {
      sendDownloadComplete(user.email, {
        recordCount: rows.length,
        format,
        downloadId: downloadLog?.id ?? '',
      })

      // Usage alert at 80% and 100%
      const limits = getPlanLimits(plan)
      const usagePercent = Math.floor((newCount / limits.monthlyDownloadRecords) * 100)
      const prevPercent = Math.floor((user.monthly_download_count / limits.monthlyDownloadRecords) * 100)
      if (usagePercent >= 80 && prevPercent < 80) {
        sendUsageAlert(user.email, { used: newCount, limit: limits.monthlyDownloadRecords, percent: 80 })
      } else if (usagePercent >= 100 && prevPercent < 100) {
        sendUsageAlert(user.email, { used: newCount, limit: limits.monthlyDownloadRecords, percent: 100 })
      }
    }

    // ----- Return file -----
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
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
  supabase: ReturnType<typeof createServiceRoleClient>,
  searchParams: z.infer<typeof downloadSchema>['search_params'],
): Promise<number> {
  // Pre-filter by industry
  let industryCompanyIds: string[] | null = null
  if (searchParams.industries && searchParams.industries.length > 0) {
    const industryConditions = searchParams.industries
      .map((code) => `jsic_code.like.${code}%`)
      .join(',')

    const { data: mappings } = await supabase
      .from('company_industry_mapping')
      .select('company_id')
      .or(industryConditions)

    industryCompanyIds = Array.from(
      new Set((mappings ?? []).map((m) => m.company_id)),
    )
    if (industryCompanyIds.length === 0) return 0
  }

  let query = supabase
    .from('companies')
    .select('id', { count: 'estimated', head: true })

  if (industryCompanyIds) {
    query = query.in('id', industryCompanyIds)
  }
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
  supabase: ReturnType<typeof createServiceRoleClient>,
  searchParams: z.infer<typeof downloadSchema>['search_params'],
  columns: AllowedColumn[],
): Promise<Record<string, unknown>[]> {
  // Build Supabase select columns from the requested CSV columns
  const selectCols = new Set<string>(columns)
  selectCols.add('id')
  if (searchParams.prefectures && searchParams.prefectures.length > 0) {
    selectCols.add('prefecture_code')
  }

  // Pre-filter by industry
  let industryCompanyIds: string[] | null = null
  if (searchParams.industries && searchParams.industries.length > 0) {
    const industryConditions = searchParams.industries
      .map((code) => `jsic_code.like.${code}%`)
      .join(',')

    const { data: mappings } = await supabase
      .from('company_industry_mapping')
      .select('company_id')
      .or(industryConditions)

    industryCompanyIds = Array.from(
      new Set((mappings ?? []).map((m) => m.company_id)),
    )
    if (industryCompanyIds.length === 0) return []
  }

  const PAGE_SIZE = 1000
  const allRows: Record<string, unknown>[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    let query = supabase
      .from('companies')
      .select(Array.from(selectCols).join(','))

    if (industryCompanyIds) {
      query = query.in('id', industryCompanyIds)
    }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allRows.push(...(rows as any as Record<string, unknown>[]))
    offset += PAGE_SIZE
    hasMore = rows.length === PAGE_SIZE
  }

  return allRows
}
