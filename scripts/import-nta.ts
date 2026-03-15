/**
 * 国税庁法人番号CSV取込スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/import-nta.ts                         # 全国版ZIP → 全件取込
 *   npx tsx scripts/import-nta.ts --prefecture 13         # 東京都のみ
 *   npx tsx scripts/import-nta.ts --prefecture 13,14      # 東京・神奈川
 *   npx tsx scripts/import-nta.ts --file /path/to/csv     # CSVファイル直接指定
 *   npx tsx scripts/import-nta.ts --dry-run               # DB書き込みなし（検証用）
 *
 * 処理フロー:
 * 1. 全国版ZIP(/tmp/nta-csv/zenkoku.zip)を解凍 → Shift-JIS → UTF-8
 * 2. 30カラム新フォーマットをパース
 * 3. --prefecture指定時は該当都道府県のみ抽出
 * 4. companiesテーブルへUPSERT（5000件/バッチ）
 *
 * 環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

// ─── Config ────────────────────────────────────────────
const BATCH_SIZE = 1000
const DOWNLOAD_DIR = '/tmp/nta-csv'
const ZENKOKU_ZIP = path.join(DOWNLOAD_DIR, 'zenkoku.zip')

// ─── NTA 30-column format (2024+) ─────────────────────
// Col  0: 序番号
// Col  1: 法人番号
// Col  2: 処理区分
// Col  3: 訂正区分
// Col  4: 更新年月日
// Col  5: 変更事由
// Col  6: 商号又は名称
// Col  7: 商号又は名称イメージID
// Col  8: 法人種別
// Col  9: 国内所在地（都道府県）
// Col 10: 国内所在地（市区町村）
// Col 11: 国内所在地（丁目番地等）
// Col 12: 国内所在地イメージID
// Col 13: 都道府県コード
// Col 14: 市区町村コード
// Col 15: 郵便番号
// Col 16: 国外所在地
// Col 17: 国外所在地イメージID
// Col 18: 閉鎖等の事由
// Col 19: 閉鎖年月日
// Col 20: 承継法人等の法人番号
// Col 21: 変更事由の詳細
// Col 22: 最終更新年月日           ★新
// Col 23: 最新履歴フラグ           ★新
// Col 24: 英語名称                 ★新
// Col 25: 英語都道府県名           ★新
// Col 26: 英語住所                 ★新（カンマ含む可能性あり）
// Col 27: 英語国外所在地           ★新
// Col 28: フリガナ                 ★旧col22→col28に移動
// Col 29: 非表示フラグ             ★旧col23→col29に移動

interface NTARecord {
  corporateNumber: string
  updateDate: string
  name: string
  kind: string
  prefectureName: string
  cityName: string
  streetNumber: string
  prefectureCode: string
  cityCode: string
  postCode: string
  addressOutside: string
  closeCause: string
  closeDate: string
  furigana: string
  hihyoji: string
  nameEn: string
}

interface CompanyUpsert {
  corporate_number: string
  name: string
  name_kana: string | null
  prefecture_code: string
  prefecture_name: string
  city_code: string | null
  city_name: string | null
  postal_code: string | null
  address: string | null
  full_address: string | null
  corporate_type: string | null
  status: string
  nta_updated_at: string
}

// ─── Helpers ───────────────────────────────────────────

function mapCorporateType(kind: string): string {
  const typeMap: Record<string, string> = {
    '101': '国の機関', '201': '地方公共団体',
    '301': '株式会社', '302': '有限会社', '303': '合名会社',
    '304': '合資会社', '305': '合同会社',
    '399': 'その他の設立登記法人', '401': '外国会社等', '499': 'その他',
  }
  return typeMap[kind] || 'その他'
}

function determineStatus(closeCause: string, closeDate: string): string {
  if (closeCause === '11' || closeCause === '21') return 'merged'
  if (closeCause || closeDate) return 'closed'
  return 'active'
}

function buildFullAddress(
  prefectureName: string, cityName: string,
  streetNumber: string, addressOutside: string
): string {
  return [prefectureName, cityName, streetNumber, addressOutside]
    .filter(Boolean).join('')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()
  // Already YYYY-MM-DD format
  if (dateStr.includes('-')) return dateStr
  // YYYYMMDD format
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }
  return new Date().toISOString()
}

function mapToCompanyUpsert(record: NTARecord): CompanyUpsert | null {
  if (!record.corporateNumber || !record.prefectureCode) return null
  if (record.hihyoji === '1') return null

  const prefCode = record.prefectureCode.padStart(2, '0')
  const fullAddress = buildFullAddress(
    record.prefectureName, record.cityName,
    record.streetNumber, record.addressOutside
  )

  return {
    corporate_number: record.corporateNumber,
    name: record.name,
    name_kana: record.furigana || null,
    prefecture_code: prefCode,
    prefecture_name: record.prefectureName,
    city_code: record.cityCode || null,
    city_name: record.cityName || null,
    postal_code: record.postCode || null,
    address: record.streetNumber || null,
    full_address: fullAddress || null,
    corporate_type: mapCorporateType(record.kind),
    status: determineStatus(record.closeCause, record.closeDate),
    nta_updated_at: formatDate(record.updateDate),
  }
}

// ─── CSV Parser (handles quoted fields with commas) ────

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  fields.push(current)
  return fields
}

function parseNTALine(cols: string[]): NTARecord {
  // 30-column new format: furigana=col28, hihyoji=col29
  // 24-column old format: furigana=col22, hihyoji=col23
  const isNewFormat = cols.length >= 28

  return {
    corporateNumber: cols[1] || '',
    updateDate: cols[4] || '',
    name: cols[6] || '',
    kind: cols[8] || '',
    prefectureName: cols[9] || '',
    cityName: cols[10] || '',
    streetNumber: cols[11] || '',
    prefectureCode: cols[13] || '',
    cityCode: cols[14] || '',
    postCode: cols[15] || '',
    addressOutside: cols[16] || '',
    closeCause: cols[18] || '',
    closeDate: cols[19] || '',
    furigana: isNewFormat ? (cols[28] || '') : (cols[22] || ''),
    hihyoji: isNewFormat ? (cols[29] || '') : (cols[23] || ''),
    nameEn: isNewFormat ? (cols[24] || '') : '',
  }
}

// ─── Extract ZIP ──────────────────────────────────────

function extractZenkokuCsv(): string {
  if (!fs.existsSync(ZENKOKU_ZIP)) {
    throw new Error(
      `全国版ZIPが見つかりません: ${ZENKOKU_ZIP}\n` +
      `https://www.houjin-bangou.nta.go.jp/download/ からダウンロードして配置してください`
    )
  }

  // Find CSV name in ZIP
  const listOutput = execSync(
    `python3 -c "import zipfile; z=zipfile.ZipFile('${ZENKOKU_ZIP}'); print('\\n'.join(i.filename for i in z.infolist() if i.filename.endswith('.csv')))"`,
  ).toString().trim()

  const csvName = listOutput.split('\n')[0]
  if (!csvName) throw new Error('ZIPにCSVファイルが見つかりません')

  const csvPath = path.join(DOWNLOAD_DIR, csvName)

  if (fs.existsSync(csvPath)) {
    console.log(`Using cached: ${csvName}`)
    return csvPath
  }

  console.log(`Extracting: ${csvName} ...`)
  execSync(
    `python3 -c "import zipfile; zipfile.ZipFile('${ZENKOKU_ZIP}').extract('${csvName}', '${DOWNLOAD_DIR}')"`,
  )

  if (!fs.existsSync(csvPath)) {
    throw new Error(`解凍後のCSVが見つかりません: ${csvPath}`)
  }

  return csvPath
}

// ─── Streaming CSV Reader ─────────────────────────────

async function* readCsvRecords(
  csvPath: string,
  filterPrefectures?: Set<string>
): AsyncGenerator<NTARecord> {
  console.log(`Reading: ${path.basename(csvPath)}`)

  const CHUNK_SIZE = 64 * 1024 * 1024 // 64MB chunks
  const fileSize = fs.statSync(csvPath).size
  const fd = fs.openSync(csvPath, 'r')
  const decoder = new TextDecoder('shift-jis', { fatal: false })

  let lineCount = 0
  let yieldCount = 0
  let leftover = ''
  let bytesRead = 0

  try {
    const buf = Buffer.alloc(CHUNK_SIZE)
    while (true) {
      const n = fs.readSync(fd, buf, 0, CHUNK_SIZE, null)
      if (n === 0) break
      bytesRead += n

      const chunk = decoder.decode(buf.subarray(0, n), { stream: true })
      const text = leftover + chunk
      const lines = text.split('\n')

      // Last element may be incomplete line
      leftover = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        lineCount++

        // Quick prefecture filter before full parse (col 13 = prefecture code)
        if (filterPrefectures) {
          const cols = parseCsvLine(trimmed)
          if (cols.length < 16) continue
          const prefCode = (cols[13] || '').padStart(2, '0')
          if (!filterPrefectures.has(prefCode)) continue

          const record = parseNTALine(cols)
          if (!record.corporateNumber) continue
          yieldCount++
          yield record
        } else {
          const cols = parseCsvLine(trimmed)
          if (cols.length < 16) continue

          const record = parseNTALine(cols)
          if (!record.corporateNumber) continue
          yieldCount++
          yield record
        }
      }

      if (lineCount % 1000000 === 0) {
        const pct = ((bytesRead / fileSize) * 100).toFixed(0)
        console.log(`  Reading: ${pct}% (${lineCount.toLocaleString()} lines)`)
      }
    }

    // Process leftover
    if (leftover.trim()) {
      const cols = parseCsvLine(leftover.trim())
      if (cols.length >= 16) {
        const record = parseNTALine(cols)
        if (record.corporateNumber) {
          if (!filterPrefectures || filterPrefectures.has(record.prefectureCode.padStart(2, '0'))) {
            yieldCount++
            yield record
          }
        }
      }
    }
  } finally {
    fs.closeSync(fd)
  }

  console.log(`  Lines read: ${lineCount.toLocaleString()}, Matched: ${yieldCount.toLocaleString()}`)
}

// ─── DB Operations ─────────────────────────────────────

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function upsertBatch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  records: CompanyUpsert[],
  batchNum: number
): Promise<{ inserted: number; failed: number }> {
  const MAX_RETRIES = 3

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('companies') as any)
        .upsert(records, { onConflict: 'corporate_number,prefecture_code' })

      if (error) {
        if (error.message.includes('timeout') && attempt < MAX_RETRIES) {
          console.warn(`  Batch ${batchNum} timeout (attempt ${attempt}/${MAX_RETRIES}), retrying...`)
          await sleep(2000 * attempt)
          continue
        }
        console.error(`  Batch ${batchNum} error: ${error.message}`)
        return { inserted: 0, failed: records.length }
      }
      return { inserted: records.length, failed: 0 }
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(`  Batch ${batchNum} exception (attempt ${attempt}/${MAX_RETRIES}), retrying...`)
        await sleep(2000 * attempt)
        continue
      }
      console.error(`  Batch ${batchNum} exception:`, err)
      return { inserted: 0, failed: records.length }
    }
  }
  return { inserted: 0, failed: records.length }
}

// ─── Main ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const prefIdx = args.indexOf('--prefecture')
  const fileIdx = args.indexOf('--file')
  const dryRun = args.includes('--dry-run')

  let filterPrefectures: Set<string> | undefined
  if (prefIdx >= 0 && args[prefIdx + 1]) {
    filterPrefectures = new Set(
      args[prefIdx + 1].split(',').map(p => p.trim().padStart(2, '0'))
    )
  }

  let csvPath: string
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    csvPath = args[fileIdx + 1]
    if (!fs.existsSync(csvPath)) {
      console.error(`File not found: ${csvPath}`)
      process.exit(1)
    }
  } else {
    csvPath = extractZenkokuCsv()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!dryRun && (!supabaseUrl || !supabaseKey)) {
    console.error('Missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = !dryRun ? createClient(supabaseUrl!, supabaseKey!) : null

  console.log('╔════════════════════════════════════════════╗')
  console.log('║   NTA Corporate Number CSV Import          ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log(`CSV: ${path.basename(csvPath)}`)
  console.log(`Filter: ${filterPrefectures ? Array.from(filterPrefectures).join(',') : 'ALL'}`)
  console.log(`Batch: ${BATCH_SIZE.toLocaleString()}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('')

  // Sync log
  let syncLogId: string | null = null
  if (supabase) {
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        source: 'nta',
        sync_type: filterPrefectures ? 'partial' : 'full',
        target_prefecture: filterPrefectures ? Array.from(filterPrefectures).join(',') : 'all',
      })
      .select('id')
      .single()
    syncLogId = syncLog?.id || null
  }

  const startTime = Date.now()
  const totals = { processed: 0, inserted: 0, skipped: 0, failed: 0 }
  const prefStats = new Map<string, number>()
  let batch: CompanyUpsert[] = []
  let batchCount = 0
  const totalBatchesEstimate = filterPrefectures
    ? '?'
    : Math.ceil(5750000 / BATCH_SIZE).toLocaleString()

  for await (const record of readCsvRecords(csvPath, filterPrefectures)) {
    totals.processed++
    const mapped = mapToCompanyUpsert(record)
    if (!mapped) {
      totals.skipped++
      continue
    }

    batch.push(mapped)
    prefStats.set(mapped.prefecture_code, (prefStats.get(mapped.prefecture_code) || 0) + 1)

    if (batch.length >= BATCH_SIZE) {
      batchCount++
      if (!dryRun && supabase) {
        const result = await upsertBatch(supabase, batch, batchCount)
        totals.inserted += result.inserted
        totals.failed += result.failed
      } else {
        totals.inserted += batch.length
      }

      if (batchCount % 100 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        console.log(
          `  Batch ${batchCount}/${totalBatchesEstimate} | ` +
          `${totals.inserted.toLocaleString()} upserted | ` +
          `${elapsed}s elapsed`
        )
      }
      batch = []
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    batchCount++
    if (!dryRun && supabase) {
      const result = await upsertBatch(supabase, batch, batchCount)
      totals.inserted += result.inserted
      totals.failed += result.failed
    } else {
      totals.inserted += batch.length
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

  // Update sync log
  if (supabase && syncLogId) {
    await supabase
      .from('sync_logs')
      .update({
        status: totals.failed > 0 ? 'completed_with_errors' : 'completed',
        records_processed: totals.processed,
        records_inserted: totals.inserted,
        records_failed: totals.failed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId)
  }

  console.log('\n════════════════════════════════════════════')
  console.log('  IMPORT COMPLETE')
  console.log('════════════════════════════════════════════')
  console.log(`  Elapsed:   ${elapsed} min`)
  console.log(`  Processed: ${totals.processed.toLocaleString()}`)
  console.log(`  Inserted:  ${totals.inserted.toLocaleString()}`)
  console.log(`  Skipped:   ${totals.skipped.toLocaleString()}`)
  console.log(`  Failed:    ${totals.failed.toLocaleString()}`)
  console.log('')

  // Per-prefecture summary
  const sortedPrefs = Array.from(prefStats.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  console.log('  Per-prefecture:')
  for (const [code, count] of sortedPrefs) {
    console.log(`    ${code}: ${count.toLocaleString()}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
