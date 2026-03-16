/**
 * 国税庁法人番号XML取込スクリプト（PostgreSQL直接接続版）
 *
 * 使用方法:
 *   npx tsx scripts/import-nta.ts                         # 全国版ZIP → 全件取込
 *   npx tsx scripts/import-nta.ts --prefecture 13         # 東京都のみ
 *   npx tsx scripts/import-nta.ts --prefecture 13,14      # 東京・神奈川
 *   npx tsx scripts/import-nta.ts --file /path/to/xml     # XMLファイル直接指定
 *   npx tsx scripts/import-nta.ts --dry-run               # DB書き込みなし（検証用）
 *
 * 処理フロー:
 * 1. 全国版ZIP(/tmp/nta-csv/zenkoku.zip)からXMLファイルを列挙
 * 2. 各XMLをストリーム解析（<corporation>要素を1件ずつ）
 * 3. --prefecture指定時は該当都道府県のみ抽出
 * 4. PostgreSQL直接接続でバッチUPSERT（1000件/バッチ）
 *
 * 環境変数:
 *   DATABASE_URL (PostgreSQL接続文字列)
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import pg from 'pg'

const { Client } = pg

// ─── Config ────────────────────────────────────────────
const BATCH_SIZE = 1000
const DOWNLOAD_DIR = '/tmp/nta-csv'
const ZENKOKU_ZIP = path.join(DOWNLOAD_DIR, 'zenkoku.zip')

// ─── NTA XML element names ─────────────────────────────
const TAG_MAP: Record<string, keyof NTARecord> = {
  corporateNumber: 'corporateNumber',
  updateDate: 'updateDate',
  name: 'name',
  kind: 'kind',
  prefectureName: 'prefectureName',
  cityName: 'cityName',
  streetNumber: 'streetNumber',
  prefectureCode: 'prefectureCode',
  cityCode: 'cityCode',
  postCode: 'postCode',
  addressOutside: 'addressOutside',
  closeCause: 'closeCause',
  closeDate: 'closeDate',
  furigana: 'furigana',
  hihyoji: 'hihyoji',
  enName: 'nameEn',
}

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

interface CompanyRow {
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
  if (dateStr.includes('-')) return dateStr
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }
  return new Date().toISOString()
}

function mapToCompanyRow(record: NTARecord): CompanyRow | null {
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

// ─── Extract XML files from ZIP ────────────────────────

function listXmlFiles(): string[] {
  if (!fs.existsSync(ZENKOKU_ZIP)) {
    throw new Error(
      `全国版ZIPが見つかりません: ${ZENKOKU_ZIP}\n` +
      `https://www.houjin-bangou.nta.go.jp/download/ からダウンロードして配置してください`
    )
  }

  const listOutput = execSync(
    `python3 -c "import zipfile; z=zipfile.ZipFile('${ZENKOKU_ZIP}'); print('\\n'.join(sorted(i.filename for i in z.infolist() if i.filename.endswith('.xml') and not i.filename.endswith('.asc'))))"`,
  ).toString().trim()

  const xmlFiles = listOutput.split('\n').filter(Boolean)
  if (xmlFiles.length === 0) throw new Error('ZIPにXMLファイルが見つかりません')
  return xmlFiles
}

function extractXmlFile(xmlName: string): string {
  const xmlPath = path.join(DOWNLOAD_DIR, xmlName)

  if (fs.existsSync(xmlPath)) {
    console.log(`  Using cached: ${xmlName}`)
    return xmlPath
  }

  console.log(`  Extracting: ${xmlName} ...`)
  execSync(
    `python3 -c "import zipfile; zipfile.ZipFile('${ZENKOKU_ZIP}').extract('${xmlName}', '${DOWNLOAD_DIR}')"`,
  )

  if (!fs.existsSync(xmlPath)) {
    throw new Error(`解凍後のXMLが見つかりません: ${xmlPath}`)
  }
  return xmlPath
}

// ─── Streaming XML Reader ──────────────────────────────

function emptyRecord(): NTARecord {
  return {
    corporateNumber: '', updateDate: '', name: '', kind: '',
    prefectureName: '', cityName: '', streetNumber: '',
    prefectureCode: '', cityCode: '', postCode: '',
    addressOutside: '', closeCause: '', closeDate: '',
    furigana: '', hihyoji: '', nameEn: '',
  }
}

const TAG_REGEX = /^\s*<(\w+)>(.*?)<\/\1>\s*$/
const SELF_CLOSE_REGEX = /^\s*<(\w+)\/>\s*$/

async function* readXmlRecords(
  xmlPath: string,
  filterPrefectures?: Set<string>
): AsyncGenerator<NTARecord> {
  const rl = createInterface({
    input: createReadStream(xmlPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  let current: NTARecord | null = null
  let lineCount = 0
  let yieldCount = 0

  for await (const line of rl) {
    lineCount++

    if (line.includes('<corporation>')) {
      current = emptyRecord()
      continue
    }

    if (line.includes('</corporation>')) {
      if (current && current.corporateNumber) {
        const prefCode = current.prefectureCode.padStart(2, '0')
        if (!filterPrefectures || filterPrefectures.has(prefCode)) {
          yieldCount++
          yield current
        }
      }
      current = null
      continue
    }

    if (!current) continue

    const selfClose = SELF_CLOSE_REGEX.exec(line)
    if (selfClose) continue

    const match = TAG_REGEX.exec(line)
    if (match) {
      const tagName = match[1]
      const value = match[2]
      const field = TAG_MAP[tagName]
      if (field) {
        current[field] = value
      }
    }

    if (lineCount % 5000000 === 0) {
      console.log(`    ${lineCount.toLocaleString()} lines processed, ${yieldCount.toLocaleString()} matched`)
    }
  }

  console.log(`    Total: ${lineCount.toLocaleString()} lines, ${yieldCount.toLocaleString()} matched`)
}

// ─── DB Operations (PostgreSQL direct) ─────────────────

const UPSERT_SQL = `
  INSERT INTO companies (
    corporate_number, name, name_kana, prefecture_code, prefecture_name,
    city_code, city_name, postal_code, address, full_address,
    corporate_type, status, nta_updated_at
  )
  SELECT * FROM UNNEST(
    $1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
    $6::text[], $7::text[], $8::text[], $9::text[], $10::text[],
    $11::text[], $12::text[], $13::timestamptz[]
  )
  ON CONFLICT (corporate_number, prefecture_code)
  DO UPDATE SET
    name = EXCLUDED.name,
    name_kana = EXCLUDED.name_kana,
    prefecture_name = EXCLUDED.prefecture_name,
    city_code = EXCLUDED.city_code,
    city_name = EXCLUDED.city_name,
    postal_code = EXCLUDED.postal_code,
    address = EXCLUDED.address,
    full_address = EXCLUDED.full_address,
    corporate_type = EXCLUDED.corporate_type,
    status = EXCLUDED.status,
    nta_updated_at = EXCLUDED.nta_updated_at,
    updated_at = NOW()
`

async function upsertBatch(
  connString: string,
  records: CompanyRow[],
  batchNum: number
): Promise<{ inserted: number; failed: number }> {
  const cols = {
    corporate_number: [] as string[],
    name: [] as string[],
    name_kana: [] as (string | null)[],
    prefecture_code: [] as string[],
    prefecture_name: [] as string[],
    city_code: [] as (string | null)[],
    city_name: [] as (string | null)[],
    postal_code: [] as (string | null)[],
    address: [] as (string | null)[],
    full_address: [] as (string | null)[],
    corporate_type: [] as (string | null)[],
    status: [] as string[],
    nta_updated_at: [] as string[],
  }

  for (const r of records) {
    cols.corporate_number.push(r.corporate_number)
    cols.name.push(r.name)
    cols.name_kana.push(r.name_kana)
    cols.prefecture_code.push(r.prefecture_code)
    cols.prefecture_name.push(r.prefecture_name)
    cols.city_code.push(r.city_code)
    cols.city_name.push(r.city_name)
    cols.postal_code.push(r.postal_code)
    cols.address.push(r.address)
    cols.full_address.push(r.full_address)
    cols.corporate_type.push(r.corporate_type)
    cols.status.push(r.status)
    cols.nta_updated_at.push(r.nta_updated_at)
  }

  const MAX_RETRIES = 5
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = new Client({ connectionString: connString, ssl: { rejectUnauthorized: false } })
    try {
      await client.connect()
      await client.query(UPSERT_SQL, [
        cols.corporate_number, cols.name, cols.name_kana,
        cols.prefecture_code, cols.prefecture_name,
        cols.city_code, cols.city_name, cols.postal_code,
        cols.address, cols.full_address,
        cols.corporate_type, cols.status, cols.nta_updated_at,
      ])
      await client.end()
      return { inserted: records.length, failed: 0 }
    } catch (err) {
      await client.end().catch(() => {})
      const msg = err instanceof Error ? err.message : String(err)
      if (attempt < MAX_RETRIES) {
        const delay = 3000 * attempt
        console.warn(`  Batch ${batchNum} error (attempt ${attempt}/${MAX_RETRIES}): ${msg.slice(0, 100)}, retrying in ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      console.error(`  Batch ${batchNum} failed: ${msg.slice(0, 200)}`)
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

  let xmlFiles: string[]
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    const filePath = args[fileIdx + 1]
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      process.exit(1)
    }
    xmlFiles = [filePath]
  } else {
    xmlFiles = listXmlFiles()
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!dryRun && !databaseUrl) {
    console.error('Missing: DATABASE_URL')
    process.exit(1)
  }

  // Verify connection
  if (!dryRun) {
    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    const res = await client.query('SELECT count(*) FROM companies')
    console.log(`DB connected. Current companies: ${Number(res.rows[0].count).toLocaleString()}`)
    await client.end()
  }

  console.log('╔════════════════════════════════════════════╗')
  console.log('║   NTA Corporate Number XML Import          ║')
  console.log('║   (PostgreSQL Direct Connection)           ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log(`XML files: ${xmlFiles.length}`)
  console.log(`Filter: ${filterPrefectures ? Array.from(filterPrefectures).join(',') : 'ALL'}`)
  console.log(`Batch: ${BATCH_SIZE.toLocaleString()}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE (PostgreSQL direct)'}`)
  console.log('')

  // Helper to run a one-off query
  async function dbQuery(sql: string, params?: unknown[]) {
    const c = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
    await c.connect()
    try {
      return await c.query(sql, params)
    } finally {
      await c.end()
    }
  }

  // Sync log
  let syncLogId: string | null = null
  if (!dryRun) {
    const res = await dbQuery(
      `INSERT INTO sync_logs (source, sync_type, target_prefecture) VALUES ($1, $2, $3) RETURNING id`,
      ['nta', filterPrefectures ? 'incremental' : 'full', filterPrefectures ? Array.from(filterPrefectures).join(',') : 'all']
    )
    syncLogId = res.rows[0]?.id || null
  }

  const startTime = Date.now()
  const totals = { processed: 0, inserted: 0, skipped: 0, failed: 0 }
  const prefStats = new Map<string, number>()
  let batch: CompanyRow[] = []
  let batchCount = 0

  for (let fi = 0; fi < xmlFiles.length; fi++) {
    const xmlName = xmlFiles[fi]
    console.log(`\n[${fi + 1}/${xmlFiles.length}] ${xmlName}`)

    const xmlPath = xmlName.startsWith('/') ? xmlName : extractXmlFile(xmlName)

    for await (const record of readXmlRecords(xmlPath, filterPrefectures)) {
      totals.processed++
      const mapped = mapToCompanyRow(record)
      if (!mapped) {
        totals.skipped++
        continue
      }

      batch.push(mapped)
      prefStats.set(mapped.prefecture_code, (prefStats.get(mapped.prefecture_code) || 0) + 1)

      if (batch.length >= BATCH_SIZE) {
        batchCount++
        if (!dryRun) {
          const result = await upsertBatch(databaseUrl!, batch, batchCount)
          totals.inserted += result.inserted
          totals.failed += result.failed
        } else {
          totals.inserted += batch.length
        }

        if (batchCount % 200 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
          console.log(
            `  Batch ${batchCount} | ` +
            `${totals.inserted.toLocaleString()} upserted | ` +
            `${totals.failed.toLocaleString()} failed | ` +
            `${elapsed}s elapsed`
          )
        }
        batch = []
      }
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    batchCount++
    if (!dryRun) {
      const result = await upsertBatch(databaseUrl!, batch, batchCount)
      totals.inserted += result.inserted
      totals.failed += result.failed
    } else {
      totals.inserted += batch.length
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

  // Update sync log
  if (!dryRun && syncLogId) {
    await dbQuery(
      `UPDATE sync_logs SET status = $1, records_processed = $2, records_inserted = $3, records_failed = $4, completed_at = NOW() WHERE id = $5`,
      [totals.failed > 0 ? 'completed_with_errors' : 'completed', totals.processed, totals.inserted, totals.failed, syncLogId]
    )
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
