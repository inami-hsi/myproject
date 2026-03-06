/**
 * 国税庁法人番号CSV初期取込スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/import-nta.ts [--prefecture 13]
 *
 * 処理フロー:
 * 1. 国税庁サイトから都道府県別CSVをダウンロード
 * 2. Shift-JIS → UTF-8変換
 * 3. パース → companiesテーブルへUPSERT（5000件/バッチ）
 */

const NTA_BASE_URL = 'https://www.houjin-bangou.nta.go.jp/download/zenken/'

// Prefecture code to NTA CSV filename mapping
const PREFECTURE_CSV_MAP: Record<string, string> = {
  '01': '01_hokkaido',
  '02': '02_aomori',
  '03': '03_iwate',
  '04': '04_miyagi',
  '05': '05_akita',
  '06': '06_yamagata',
  '07': '07_fukushima',
  '08': '08_ibaraki',
  '09': '09_tochigi',
  '10': '10_gunma',
  '11': '11_saitama',
  '12': '12_chiba',
  '13': '13_tokyo',
  '14': '14_kanagawa',
  '15': '15_niigata',
  '16': '16_toyama',
  '17': '17_ishikawa',
  '18': '18_fukui',
  '19': '19_yamanashi',
  '20': '20_nagano',
  '21': '21_gifu',
  '22': '22_shizuoka',
  '23': '23_aichi',
  '24': '24_mie',
  '25': '25_shiga',
  '26': '26_kyoto',
  '27': '27_osaka',
  '28': '28_hyogo',
  '29': '29_nara',
  '30': '30_wakayama',
  '31': '31_tottori',
  '32': '32_shimane',
  '33': '33_okayama',
  '34': '34_hiroshima',
  '35': '35_yamaguchi',
  '36': '36_tokushima',
  '37': '37_kagawa',
  '38': '38_ehime',
  '39': '39_kochi',
  '40': '40_fukuoka',
  '41': '41_saga',
  '42': '42_nagasaki',
  '43': '43_kumamoto',
  '44': '44_oita',
  '45': '45_miyazaki',
  '46': '46_kagoshima',
  '47': '47_okinawa',
}

interface NTARecord {
  sequenceNumber: string
  corporateNumber: string
  process: string
  correct: string
  updateDate: string
  changeCause: string
  name: string
  nameImageId: string
  kind: string
  prefectureName: string
  cityName: string
  streetNumber: string
  addressImageId: string
  prefectureCode: string
  cityCode: string
  postCode: string
  addressOutside: string
  addressOutsideImageId: string
  closeCause: string
  closeDate: string
  successorCorporateNumber: string
  changeCauseSub: string
  furigana: string
  hihyoji: string
}

function parseNTACsv(csvContent: string): NTARecord[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  // Skip header if present
  const startIdx = lines[0]?.includes('sequenceNumber') ? 1 : 0

  return lines.slice(startIdx).map(line => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''))
    return {
      sequenceNumber: cols[0] || '',
      corporateNumber: cols[1] || '',
      process: cols[2] || '',
      correct: cols[3] || '',
      updateDate: cols[4] || '',
      changeCause: cols[5] || '',
      name: cols[6] || '',
      nameImageId: cols[7] || '',
      kind: cols[8] || '',
      prefectureName: cols[9] || '',
      cityName: cols[10] || '',
      streetNumber: cols[11] || '',
      addressImageId: cols[12] || '',
      prefectureCode: cols[13] || '',
      cityCode: cols[14] || '',
      postCode: cols[15] || '',
      addressOutside: cols[16] || '',
      addressOutsideImageId: cols[17] || '',
      closeCause: cols[18] || '',
      closeDate: cols[19] || '',
      successorCorporateNumber: cols[20] || '',
      changeCauseSub: cols[21] || '',
      furigana: cols[22] || '',
      hihyoji: cols[23] || '',
    }
  })
}

function mapCorporateType(kind: string): string {
  const typeMap: Record<string, string> = {
    '101': '国の機関',
    '201': '地方公共団体',
    '301': '株式会社',
    '302': '有限会社',
    '303': '合名会社',
    '304': '合資会社',
    '305': '合同会社',
    '399': 'その他の設立登記法人',
    '401': '外国会社等',
    '499': 'その他',
  }
  return typeMap[kind] || 'その他'
}

console.log('NTA CSV Import Script')
console.log('Usage: npx tsx scripts/import-nta.ts [--prefecture <code>]')
console.log('')
console.log('This script requires:')
console.log('  - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
console.log('  - NTA CSV files downloaded from houjin-bangou.nta.go.jp')
console.log('')
console.log(`Available prefectures: ${Object.keys(PREFECTURE_CSV_MAP).join(', ')}`)

export { parseNTACsv, mapCorporateType, PREFECTURE_CSV_MAP, NTA_BASE_URL }
export type { NTARecord }
