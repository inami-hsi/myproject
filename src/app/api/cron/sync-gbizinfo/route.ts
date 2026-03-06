import { NextRequest, NextResponse } from 'next/server'
import { GBizInfoClient } from '@/lib/gbizinfo/client'
import type { GBizCompany } from '@/lib/gbizinfo/client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createSyncLog, updateSyncLog, batchUpsert } from '@/lib/sync/utils'

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

  // ── Prefecture rotation ────────────────────────────────
  const today = new Date()
  const dayOfCycle = today.getDate() % PREFECTURES_PER_DAY // 0-6
  const start = dayOfCycle * PREFECTURES_PER_DAY
  const todayPrefectures = PREFECTURES.slice(start, start + PREFECTURES_PER_DAY).filter(Boolean)

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
        let totalPages = 1

        while (page <= totalPages) {
          const response = await client.fetchByPrefecture(prefectureCode, page)
          const companies = response['hojin-infos'] || []
          totalPages = response.totalPage || 1
          prefResult.pages = totalPages

          if (companies.length === 0) break

          // ── Map to gBizINFO-only fields for upsert ───────
          const upsertRecords = companies.map((item) =>
            client.mapToGBizFields(item)
          )

          // ── Batch upsert (only gBizINFO fields) ──────────
          const upsertResult = await batchUpsert(
            'companies',
            upsertRecords,
            'corporate_number',
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
 * For each company, look up its business_items_summary codes in gbiz_industry_mapping
 * and upsert into company_industry_mapping. Log unmapped industries.
 */
async function processIndustryMappings(
  supabase: ReturnType<typeof createServiceRoleClient>,
  companies: GBizCompany[],
  result: PrefectureResult
) {
  for (const company of companies) {
    const edaCodes = (company.business_items_summary || [])
      .map((s) => s.business_items_code)
      .filter((code): code is string => !!code)

    if (edaCodes.length === 0) continue

    // Look up all EDA codes in the mapping table
    const { data: mappings } = await supabase
      .from('gbiz_industry_mapping')
      .select('eda_code, jsic_code, confidence')
      .in('eda_code', edaCodes)

    const mappedEdaCodes = new Set((mappings || []).map((m) => m.eda_code))

    // Resolve company_id from corporate_number
    const { data: companyRow } = await supabase
      .from('companies')
      .select('id')
      .eq('corporate_number', company.corporate_number)
      .single()

    if (!companyRow) continue

    // Upsert mapped industries
    if (mappings && mappings.length > 0) {
      const industryRecords = mappings.map((m) => ({
        company_id: companyRow.id,
        jsic_code: m.jsic_code,
        source: 'gbizinfo' as const,
        confidence: m.confidence,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('company_industry_mapping') as any)
        .upsert(industryRecords, {
          onConflict: 'company_id,jsic_code',
        })

      if (!error) {
        result.industryMapped += industryRecords.length
      }
    }

    // Log unmapped EDA codes
    const unmappedCodes = edaCodes.filter((code) => !mappedEdaCodes.has(code))
    if (unmappedCodes.length > 0) {
      const unmappedRecords = unmappedCodes.map((code) => ({
        eda_code: code,
        business_items: company.business_items || null,
        corporate_number: company.corporate_number,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('unmapped_industries') as any)
        .upsert(unmappedRecords, {
          onConflict: 'corporate_number,eda_code',
          ignoreDuplicates: true,
        })
        .catch((err: unknown) => {
          // Non-critical: log and continue
          console.warn(
            `[sync-gbizinfo] Failed to log unmapped industries for ${company.corporate_number}:`,
            err
          )
        })

      result.industryUnmapped += unmappedCodes.length
    }
  }
}
