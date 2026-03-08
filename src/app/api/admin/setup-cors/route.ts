import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { configureBucketCors, getBucketCors } from '@/lib/evergreen/storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cors = await getBucketCors()
  return NextResponse.json(cors)
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://company-list-builder.vercel.app'
  const result = await configureBucketCors(appUrl)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // Verify
  const cors = await getBucketCors()
  return NextResponse.json({ message: 'CORS configured', cors })
}
