import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const shareFiltersSchema = z.object({
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
  sort_by: z.enum(['name', 'capital', 'employee_count', 'updated_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
})

// ---------------------------------------------------------------------------
// POST /api/search/share — Create a shareable link from filters
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = shareFiltersSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Encode filters as base64 JSON token
    const jsonStr = JSON.stringify(parsed.data)
    const token = Buffer.from(jsonStr, 'utf-8').toString('base64url')

    // Build shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const shareUrl = `${baseUrl}/search?share=${token}`

    return NextResponse.json({ url: shareUrl, token })
  } catch (error) {
    console.error('Share search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// GET /api/search/share?token=xxx — Decode a share token
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 },
      )
    }

    // Decode base64url token
    let filters: unknown
    try {
      const jsonStr = Buffer.from(token, 'base64url').toString('utf-8')
      filters = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 },
      )
    }

    // Validate decoded filters
    const parsed = shareFiltersSchema.safeParse(filters)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 400 },
      )
    }

    return NextResponse.json({ filters: parsed.data })
  } catch (error) {
    console.error('Decode share token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
