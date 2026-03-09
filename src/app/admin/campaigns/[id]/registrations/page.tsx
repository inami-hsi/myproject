import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { CleanupButton } from './cleanup-button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RegistrationsPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, sessions(starts_at)')
    .eq('campaign_id', id)
    .order('registered_at', { ascending: false })

  // Get view completion and purchase status for each registration
  const regIds = (registrations ?? []).map((r) => r.id)
  let completedSet = new Set<string>()
  let purchasedSet = new Set<string>()

  if (regIds.length > 0) {
    const [completionsResult, paymentsResult] = await Promise.all([
      supabase
        .from('view_events')
        .select('registration_id')
        .in('registration_id', regIds)
        .eq('event_type', 'complete'),
      supabase
        .from('payments')
        .select('registration_id')
        .in('registration_id', regIds)
        .eq('status', 'succeeded'),
    ])

    completedSet = new Set((completionsResult.data ?? []).map((c) => c.registration_id))
    purchasedSet = new Set((paymentsResult.data ?? []).map((p) => p.registration_id))
  }

  return (
    <div>
      <Link href={`/admin/campaigns/${id}`} className="text-sm text-eg-text-secondary hover:text-eg-accent">
        &larr; {campaign.name}
      </Link>
      <h1 className="mt-1 font-eg-heading text-2xl font-bold text-eg-primary">
        登録者一覧
      </h1>
      <div className="mt-1 flex items-center gap-4">
        <p className="text-sm text-eg-text-secondary">
          {(registrations ?? []).length}人の登録者
        </p>
        {(registrations ?? []).length > 0 && (
          <>
            <a
              href={`/api/admin/campaigns/${id}/registrations/export`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-eg-text-secondary hover:bg-gray-50"
            >
              CSVエクスポート
            </a>
            <CleanupButton campaignId={id} />
          </>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">名前</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">メール</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">セッション日時</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">視聴</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">購入</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">UTM</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">登録日時</th>
              </tr>
            </thead>
            <tbody>
              {(registrations ?? []).map((reg) => {
                const sessionArr = reg.sessions as unknown as { starts_at: string }[] | null
                const session = sessionArr?.[0]
                const isCompleted = completedSet.has(reg.id)
                const isPurchased = purchasedSet.has(reg.id)

                return (
                  <tr key={reg.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-eg-text-primary">{reg.name}</td>
                    <td className="px-4 py-3 text-eg-text-secondary">{reg.email}</td>
                    <td className="px-4 py-3 text-eg-text-secondary">
                      {session
                        ? new Date(session.starts_at).toLocaleString('ja-JP', {
                            timeZone: 'Asia/Tokyo',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          isCompleted
                            ? 'bg-eg-success/10 text-eg-success'
                            : 'bg-gray-100 text-eg-text-secondary'
                        }`}
                      >
                        {isCompleted ? '完了' : '未視聴'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          isPurchased
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100 text-eg-text-secondary'
                        }`}
                      >
                        {isPurchased ? '購入済' : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-eg-text-secondary">
                      {[reg.utm_source, reg.utm_medium, reg.utm_campaign].filter(Boolean).join(' / ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-eg-text-secondary">
                      {new Date(reg.registered_at).toLocaleString('ja-JP', {
                        timeZone: 'Asia/Tokyo',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                )
              })}
              {(registrations ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-eg-text-secondary">
                    まだ登録者がいません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
