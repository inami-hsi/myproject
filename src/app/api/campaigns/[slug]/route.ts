import { NextRequest, NextResponse } from 'next/server'
import { getCampaignBySlug } from '@/lib/evergreen/queries'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  return NextResponse.json(campaign)
}
