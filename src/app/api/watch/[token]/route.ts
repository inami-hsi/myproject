import { NextRequest, NextResponse } from 'next/server'
import { getWatchPageData } from '@/lib/evergreen/queries'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const data = await getWatchPageData(token)

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
