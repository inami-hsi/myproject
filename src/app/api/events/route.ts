import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

const eventSchema = z.object({
  registration_id: z.string().uuid(),
  event_type: z.enum(['page_view', 'play', 'pause', 'seek', 'complete', 'leave']),
  progress_percent: z.number().int().min(0).max(100).default(0),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = eventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('view_events').insert(parsed.data)

    if (error) {
      console.error('Event tracking error:', error)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
