import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * DELETE - Clean up test registrations, payments, email_logs, and view_events for a campaign.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceRoleClient()

  // Get all registration IDs for this campaign
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id')
    .eq('campaign_id', id)

  const regIds = (registrations ?? []).map((r) => r.id)

  const results: Record<string, number> = {}

  if (regIds.length > 0) {
    // Delete view_events
    const { count: viewCount } = await supabase
      .from('view_events')
      .delete({ count: 'exact' })
      .in('registration_id', regIds)
    results.view_events = viewCount ?? 0

    // Delete email_logs
    const { count: emailCount } = await supabase
      .from('email_logs')
      .delete({ count: 'exact' })
      .in('registration_id', regIds)
    results.email_logs = emailCount ?? 0

    // Delete payments
    const { count: paymentCount } = await supabase
      .from('payments')
      .delete({ count: 'exact' })
      .in('registration_id', regIds)
    results.payments = paymentCount ?? 0

    // Delete registrations
    const { count: regCount } = await supabase
      .from('registrations')
      .delete({ count: 'exact' })
      .eq('campaign_id', id)
    results.registrations = regCount ?? 0
  }

  return NextResponse.json({ success: true, deleted: results })
}
