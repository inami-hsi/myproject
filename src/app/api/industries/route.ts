import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndustryNode {
  code: string
  name: string
  level: 'major' | 'middle'
  parent_code: string | null
  children?: IndustryChild[]
}

interface IndustryChild {
  code: string
  name: string
  level: string
}

// ---------------------------------------------------------------------------
// GET /api/industries
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Fetch major and middle level classifications
    const { data, error } = await supabase
      .from('industry_classifications')
      .select('code, name, level, parent_code')
      .in('level', ['major', 'middle'])
      .order('code', { ascending: true })

    if (error) {
      console.error('Industries query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch industry classifications' },
        { status: 500 },
      )
    }

    // Build hierarchy: major categories with their middle-level children
    const majorMap = new Map<string, IndustryNode>()
    const middleItems: Array<{
      code: string
      name: string
      level: string
      parent_code: string | null
    }> = []

    for (const item of data ?? []) {
      if (item.level === 'major') {
        majorMap.set(item.code, {
          code: item.code,
          name: item.name,
          level: 'major',
          parent_code: null,
          children: [],
        })
      } else if (item.level === 'middle') {
        middleItems.push(item)
      }
    }

    // Assign middle-level items to their parent major category
    for (const item of middleItems) {
      if (item.parent_code && majorMap.has(item.parent_code)) {
        majorMap.get(item.parent_code)!.children!.push({
          code: item.code,
          name: item.name,
          level: item.level,
        })
      }
    }

    const industries = Array.from(majorMap.values())

    const response = NextResponse.json({ industries })

    // 24-hour cache with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=3600',
    )

    return response
  } catch (error) {
    console.error('Industries endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
