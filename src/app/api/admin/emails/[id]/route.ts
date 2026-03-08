import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  subject: z.string().min(1).max(500).optional(),
  body_html: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('email_templates')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
