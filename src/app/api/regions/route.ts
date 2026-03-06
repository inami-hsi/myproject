import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Prefecture {
  code: string
  name: string
}

interface Region {
  name: string
  prefectures: Prefecture[]
}

// ---------------------------------------------------------------------------
// Region ordering (standard Japanese region grouping)
// ---------------------------------------------------------------------------

const REGION_ORDER = [
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州',
]

// ---------------------------------------------------------------------------
// GET /api/regions
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('prefectures')
      .select('code, name, region')
      .order('code', { ascending: true })

    if (error) {
      console.error('Regions query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch regions' },
        { status: 500 },
      )
    }

    // Group prefectures by region
    const regionMap = new Map<string, Prefecture[]>()

    for (const pref of data ?? []) {
      if (!regionMap.has(pref.region)) {
        regionMap.set(pref.region, [])
      }
      regionMap.get(pref.region)!.push({
        code: pref.code,
        name: pref.name,
      })
    }

    // Build response in standard region order
    const regions: Region[] = []

    for (const regionName of REGION_ORDER) {
      const prefectures = regionMap.get(regionName)
      if (prefectures && prefectures.length > 0) {
        regions.push({
          name: regionName,
          prefectures,
        })
      }
    }

    // Append any regions not in the predefined order (safety net)
    regionMap.forEach((prefectures, regionName) => {
      if (!REGION_ORDER.includes(regionName) && prefectures.length > 0) {
        regions.push({
          name: regionName,
          prefectures,
        })
      }
    })

    const response = NextResponse.json({ regions })

    // 24-hour cache with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=3600',
    )

    return response
  } catch (error) {
    console.error('Regions endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
