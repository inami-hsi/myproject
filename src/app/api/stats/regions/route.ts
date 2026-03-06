import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Region mapping (prefecture -> region)
// ---------------------------------------------------------------------------

const REGION_MAP: Record<string, string> = {
  '北海道': '北海道',
  '青森県': '東北', '岩手県': '東北', '宮城県': '東北',
  '秋田県': '東北', '山形県': '東北', '福島県': '東北',
  '茨城県': '関東', '栃木県': '関東', '群馬県': '関東',
  '埼玉県': '関東', '千葉県': '関東', '東京都': '関東', '神奈川県': '関東',
  '新潟県': '中部', '富山県': '中部', '石川県': '中部',
  '福井県': '中部', '山梨県': '中部', '長野県': '中部',
  '岐阜県': '中部', '静岡県': '中部', '愛知県': '中部',
  '三重県': '近畿', '滋賀県': '近畿', '京都府': '近畿',
  '大阪府': '近畿', '兵庫県': '近畿', '奈良県': '近畿', '和歌山県': '近畿',
  '鳥取県': '中国', '島根県': '中国', '岡山県': '中国',
  '広島県': '中国', '山口県': '中国',
  '徳島県': '四国', '香川県': '四国', '愛媛県': '四国', '高知県': '四国',
  '福岡県': '九州沖縄', '佐賀県': '九州沖縄', '長崎県': '九州沖縄',
  '熊本県': '九州沖縄', '大分県': '九州沖縄', '宮崎県': '九州沖縄',
  '鹿児島県': '九州沖縄', '沖縄県': '九州沖縄',
}

const REGION_ORDER = [
  '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州沖縄',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrefectureStat {
  prefecture_code: string
  prefecture_name: string
  region: string
  total_companies: number
  with_website: number
  avg_capital: number | null
  avg_employees: number | null
}

interface RegionStat {
  name: string
  total_companies: number
  with_website: number
  prefecture_count: number
}

// ---------------------------------------------------------------------------
// GET /api/stats/regions
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Query the mv_prefecture_summary materialized view
    const { data, error } = await supabase
      .from('mv_prefecture_summary')
      .select('prefecture_code, prefecture_name, region, total_companies, with_website, avg_capital, avg_employees')
      .order('prefecture_code', { ascending: true })

    if (error) {
      console.error('[stats/regions] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch regional statistics' },
        { status: 500 },
      )
    }

    const prefectures: PrefectureStat[] = (data ?? []).map((row) => ({
      prefecture_code: row.prefecture_code,
      prefecture_name: row.prefecture_name,
      region: row.region || REGION_MAP[row.prefecture_name] || '不明',
      total_companies: row.total_companies ?? 0,
      with_website: row.with_website ?? 0,
      avg_capital: row.avg_capital,
      avg_employees: row.avg_employees,
    }))

    // Aggregate by region
    const regionAgg = new Map<string, { total_companies: number; with_website: number; prefecture_count: number }>()

    for (const pref of prefectures) {
      const regionName = pref.region
      if (!regionAgg.has(regionName)) {
        regionAgg.set(regionName, { total_companies: 0, with_website: 0, prefecture_count: 0 })
      }
      const agg = regionAgg.get(regionName)!
      agg.total_companies += pref.total_companies
      agg.with_website += pref.with_website
      agg.prefecture_count += 1
    }

    // Build regions array in standard order
    const regions: RegionStat[] = []
    for (const name of REGION_ORDER) {
      const agg = regionAgg.get(name)
      if (agg) {
        regions.push({ name, ...agg })
      }
    }
    // Append any regions not in the predefined order
    regionAgg.forEach((agg, name) => {
      if (!REGION_ORDER.includes(name)) {
        regions.push({ name, ...agg })
      }
    })

    const total = prefectures.reduce((sum, p) => sum + p.total_companies, 0)

    return NextResponse.json({
      prefectures,
      regions,
      total,
    })
  } catch (error) {
    console.error('[stats/regions] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
