import { NextRequest, NextResponse } from 'next/server'
import { GBizInfoClient } from '@/lib/gbizinfo/client'
import type { GBizCompany } from '@/lib/gbizinfo/client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createSyncLog, updateSyncLog, batchUpsert } from '@/lib/sync/utils'

export const dynamic = 'force-dynamic'

// All 47 prefecture codes, zero-padded
const PREFECTURES = Array.from({ length: 47 }, (_, i) =>
  String(i + 1).padStart(2, '0')
)

const PREFECTURES_PER_DAY = 7
const MAX_PER_PAGE = 5000

interface PrefectureResult {
  prefectureCode: string
  fetched: number
  upserted: number
  failed: number
  industryMapped: number
  industryUnmapped: number
  pages: number
}

/**
 * Vercel Cron / manual trigger for gBizINFO enrichment sync.
 *
 * Each run processes 7 prefectures, rotating through all 47 in a 7-day cycle.
 * Only gBizINFO-specific fields are upserted; NTA-owned fields are never overwritten.
 */
export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Prefecture selection ───────────────────────────────
  // Allow override via query param: ?prefectures=08,09,10
  const url = new URL(request.url)
  const overridePrefectures = url.searchParams.get('prefectures')

  let todayPrefectures: string[]
  let dayOfCycle: number

  if (overridePrefectures) {
    todayPrefectures = overridePrefectures.split(',').filter(Boolean)
    dayOfCycle = -1 // manual override
  } else {
    const today = new Date()
    dayOfCycle = today.getDate() % PREFECTURES_PER_DAY // 0-6
    const start = dayOfCycle * PREFECTURES_PER_DAY
    todayPrefectures = PREFECTURES.slice(start, start + PREFECTURES_PER_DAY).filter(Boolean)
  }

  // ── Sync log ───────────────────────────────────────────
  const syncLog = await createSyncLog(
    'gbizinfo',
    'incremental',
    todayPrefectures.join(',')
  )

  const token = process.env.GBIZINFO_API_TOKEN
  if (!token) {
    await updateSyncLog(syncLog.id, {
      status: 'failed',
      error_message: 'GBIZINFO_API_TOKEN is not configured',
    })
    return NextResponse.json(
      { error: 'GBIZINFO_API_TOKEN is not configured' },
      { status: 500 }
    )
  }

  const client = new GBizInfoClient(token)
  const supabase = createServiceRoleClient()

  let totalProcessed = 0
  let totalInserted = 0
  let totalFailed = 0
  const results: PrefectureResult[] = []

  try {
    for (const prefectureCode of todayPrefectures) {
      const prefResult: PrefectureResult = {
        prefectureCode,
        fetched: 0,
        upserted: 0,
        failed: 0,
        industryMapped: 0,
        industryUnmapped: 0,
        pages: 0,
      }

      try {
        let page = 1
        const PAGE_SIZE = 1000 // gBizINFO returns max 1000 per page

        while (true) {
          const response = await client.fetchByPrefecture(prefectureCode, page)
          const companies = response['hojin-infos'] || []
          prefResult.pages = page

          if (companies.length === 0) break

          // ── Map to full company records for upsert ───────
          const upsertRecords = companies.map((item) =>
            client.mapToCompany(item)
          )

          // ── Batch upsert (partitioned table requires both columns) ──
          const upsertResult = await batchUpsert(
            'companies',
            upsertRecords,
            'corporate_number,prefecture_code',
            MAX_PER_PAGE
          )

          prefResult.fetched += companies.length
          prefResult.upserted += upsertResult.inserted
          prefResult.failed += upsertResult.failed

          // ── Industry mapping ─────────────────────────────
          await processIndustryMappings(
            supabase,
            companies,
            prefResult
          )

          // If fewer than PAGE_SIZE records, we've reached the last page
          if (companies.length < PAGE_SIZE) break
          page++
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(
          `[sync-gbizinfo] Prefecture ${prefectureCode} error: ${message}`
        )
        prefResult.failed += prefResult.fetched - prefResult.upserted
      }

      totalProcessed += prefResult.fetched
      totalInserted += prefResult.upserted
      totalFailed += prefResult.failed
      results.push(prefResult)
    }

    // ── Finalise sync log ──────────────────────────────────
    await updateSyncLog(syncLog.id, {
      status: 'completed',
      records_processed: totalProcessed,
      records_inserted: totalInserted,
      records_updated: 0,
      records_failed: totalFailed,
    })

    return NextResponse.json({
      success: true,
      syncLogId: syncLog.id,
      dayOfCycle,
      prefectures: todayPrefectures,
      summary: {
        totalProcessed,
        totalInserted,
        totalFailed,
      },
      details: results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[sync-gbizinfo] Fatal error: ${message}`)

    await updateSyncLog(syncLog.id, {
      status: 'failed',
      records_processed: totalProcessed,
      records_inserted: totalInserted,
      records_failed: totalFailed,
      error_message: message,
    })

    return NextResponse.json(
      {
        success: false,
        syncLogId: syncLog.id,
        error: message,
        summary: {
          totalProcessed,
          totalInserted,
          totalFailed,
        },
      },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────
// Industry mapping helpers
// ─────────────────────────────────────────────────────────

/**
 * Batch-process industry mappings for all companies in a page.
 *
 * Collects all EDA codes and corporate_numbers upfront, then resolves
 * mappings and company IDs in bulk (4 queries per page instead of ~3N).
 */
async function processIndustryMappings(
  supabase: ReturnType<typeof createServiceRoleClient>,
  companies: GBizCompany[],
  result: PrefectureResult
) {
  // ── 1. Collect all unique EDA codes and corporate_numbers ──
  const allEdaCodes = new Set<string>()
  const companiesWithCodes: {
    corporateNumber: string
    edaCodes: string[]
    businessItems: string | null
  }[] = []

  for (const company of companies) {
    const edaCodes = (company.business_items_summary || [])
      .map((s) => s.business_items_code)
      .filter((code): code is string => !!code)

    if (edaCodes.length === 0) continue

    edaCodes.forEach((code) => allEdaCodes.add(code))
    companiesWithCodes.push({
      corporateNumber: company.corporate_number,
      edaCodes,
      businessItems: company.business_items || null,
    })
  }

  if (companiesWithCodes.length === 0) return

  // ── 2. Bulk fetch: EDA → JSIC mappings ─────────────────────
  const edaCodesArray = Array.from(allEdaCodes)
  const { data: allMappings } = await supabase
    .from('gbiz_industry_mapping')
    .select('eda_code, jsic_code, confidence')
    .in('eda_code', edaCodesArray)

  const mappingsByEda = new Map<string, { jsic_code: string; confidence: number }[]>()
  for (const m of allMappings || []) {
    const list = mappingsByEda.get(m.eda_code) || []
    list.push({ jsic_code: m.jsic_code, confidence: m.confidence })
    mappingsByEda.set(m.eda_code, list)
  }

  // ── 3. Bulk fetch: corporate_number → company ID ───────────
  const corporateNumbers = companiesWithCodes.map((c) => c.corporateNumber)
  const { data: companyRows } = await supabase
    .from('companies')
    .select('id, corporate_number')
    .in('corporate_number', corporateNumbers)

  const idByCorporateNumber = new Map<string, string>()
  for (const row of companyRows || []) {
    idByCorporateNumber.set(row.corporate_number, row.id)
  }

  // ── 4. Build batch records ─────────────────────────────────
  const industryRecords: {
    company_id: string
    jsic_code: string
    source: 'gbizinfo'
    confidence: number
  }[] = []
  const unmappedRecords: {
    eda_code: string
    business_items: string | null
    corporate_number: string
  }[] = []

  for (const entry of companiesWithCodes) {
    const companyId = idByCorporateNumber.get(entry.corporateNumber)
    if (!companyId) continue

    for (const edaCode of entry.edaCodes) {
      const jsicMappings = mappingsByEda.get(edaCode)
      if (jsicMappings) {
        for (const m of jsicMappings) {
          industryRecords.push({
            company_id: companyId,
            jsic_code: m.jsic_code,
            source: 'gbizinfo',
            confidence: m.confidence,
          })
        }
      } else {
        unmappedRecords.push({
          eda_code: edaCode,
          business_items: entry.businessItems,
          corporate_number: entry.corporateNumber,
        })
      }
    }
  }

  // ── 5. Batch upsert: industry mappings ─────────────────────
  if (industryRecords.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('company_industry_mapping') as any)
      .upsert(industryRecords, { onConflict: 'company_id,jsic_code' })

    if (!error) {
      result.industryMapped += industryRecords.length
    }
  }

  // ── 6. Batch upsert: unmapped industries ───────────────────
  if (unmappedRecords.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('unmapped_industries') as any)
      .upsert(unmappedRecords, {
        onConflict: 'corporate_number,eda_code',
        ignoreDuplicates: true,
      })
      .catch((err: unknown) => {
        console.warn(
          `[sync-gbizinfo] Failed to log ${unmappedRecords.length} unmapped industries:`,
          err
        )
      })

    result.industryUnmapped += unmappedRecords.length
  }
}
