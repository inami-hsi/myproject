import Link from 'next/link'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { AnalyticsCharts } from './analytics-charts'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createServiceRoleClient()

  // Fetch all campaigns with their metrics
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, slug, is_active, created_at')
    .order('created_at', { ascending: false })

  const campaignIds = (campaigns ?? []).map((c) => c.id)

  // Parallel queries for metrics
  const [
    registrationsResult,
    viewEventsResult,
    emailLogsResult,
  ] = await Promise.all([
    supabase
      .from('registrations')
      .select('id, campaign_id, registered_at')
      .in('campaign_id', campaignIds.length > 0 ? campaignIds : ['']),
    supabase
      .from('view_events')
      .select('id, registration_id, event_type, created_at')
      .in('event_type', ['page_view', 'play', 'complete']),
    supabase
      .from('email_logs')
      .select('id, status, sent_at')
      .in('status', ['sent', 'failed', 'bounced']),
  ])

  const registrations = registrationsResult.data ?? []
  const viewEvents = viewEventsResult.data ?? []
  const emailLogs = emailLogsResult.data ?? []

  // Build per-campaign metrics
  const campaignMetrics = (campaigns ?? []).map((campaign) => {
    const regs = registrations.filter((r) => r.campaign_id === campaign.id)
    const regIds = new Set(regs.map((r) => r.id))

    const views = viewEvents.filter((v) => regIds.has(v.registration_id))
    const pageViews = views.filter((v) => v.event_type === 'page_view').length
    const plays = views.filter((v) => v.event_type === 'play').length
    const completes = views.filter((v) => v.event_type === 'complete').length

    const uniqueCompletes = new Set(
      views.filter((v) => v.event_type === 'complete').map((v) => v.registration_id)
    ).size

    return {
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      isActive: campaign.is_active,
      registrations: regs.length,
      pageViews,
      plays,
      completes,
      uniqueCompletes,
      conversionRate: pageViews > 0 ? ((regs.length / pageViews) * 100).toFixed(1) : '0.0',
      completionRate: regs.length > 0 ? ((uniqueCompletes / regs.length) * 100).toFixed(1) : '0.0',
    }
  })

  // Overall stats
  const totalRegistrations = registrations.length
  const totalPageViews = viewEvents.filter((v) => v.event_type === 'page_view').length
  const totalCompletes = new Set(
    viewEvents.filter((v) => v.event_type === 'complete').map((v) => v.registration_id)
  ).size
  const totalEmailsSent = emailLogs.filter((e) => e.status === 'sent').length
  const totalEmailsFailed = emailLogs.filter((e) => e.status === 'failed' || e.status === 'bounced').length

  // Daily registration data (last 30 days)
  const now = new Date()
  const dailyData: { date: string; count: number }[] = []

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().slice(0, 10)
    const count = registrations.filter((r) => r.registered_at?.slice(0, 10) === dateStr).length
    dailyData.push({ date: dateStr, count })
  }

  return (
    <div>
      <h1 className="font-eg-heading text-2xl font-bold text-eg-primary">
        アナリティクス
      </h1>
      <p className="mt-1 text-sm text-eg-text-secondary">
        キャンペーン全体のパフォーマンスを確認できます
      </p>

      {/* Overall Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: '総登録者数', value: totalRegistrations.toLocaleString(), sub: '' },
          { label: 'LP閲覧数', value: totalPageViews.toLocaleString(), sub: '' },
          { label: '視聴完了者', value: totalCompletes.toLocaleString(), sub: totalRegistrations > 0 ? `${((totalCompletes / totalRegistrations) * 100).toFixed(1)}%` : '' },
          { label: 'メール送信', value: totalEmailsSent.toLocaleString(), sub: totalEmailsFailed > 0 ? `${totalEmailsFailed}件失敗` : '' },
          { label: 'アクティブキャンペーン', value: (campaigns ?? []).filter((c) => c.is_active).length.toString(), sub: `全${(campaigns ?? []).length}件` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-eg-text-secondary">{stat.label}</p>
            <p className="mt-1 font-eg-heading text-2xl font-bold text-eg-primary">{stat.value}</p>
            {stat.sub && <p className="mt-0.5 text-xs text-eg-text-secondary">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Registration Chart */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">
          登録者数推移（直近30日）
        </h2>
        <AnalyticsCharts dailyData={dailyData} />
      </div>

      {/* Campaign Performance Table */}
      <div className="mt-8">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">
          キャンペーン別パフォーマンス
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">キャンペーン</th>
                  <th className="px-4 py-3 text-right font-medium text-eg-text-secondary">LP閲覧</th>
                  <th className="px-4 py-3 text-right font-medium text-eg-text-secondary">登録者</th>
                  <th className="px-4 py-3 text-right font-medium text-eg-text-secondary">CVR</th>
                  <th className="px-4 py-3 text-right font-medium text-eg-text-secondary">再生</th>
                  <th className="px-4 py-3 text-right font-medium text-eg-text-secondary">視聴完了</th>
                  <th className="px-4 py-3 text-right font-medium text-eg-text-secondary">完了率</th>
                  <th className="px-4 py-3 text-center font-medium text-eg-text-secondary">状態</th>
                </tr>
              </thead>
              <tbody>
                {campaignMetrics.map((cm) => (
                  <tr key={cm.id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/campaigns/${cm.id}`}
                        className="font-medium text-eg-primary hover:text-eg-accent"
                      >
                        {cm.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-eg-text-secondary">
                      {cm.pageViews.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-eg-text-secondary">
                      {cm.registrations.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-eg-text-secondary">
                      {cm.conversionRate}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-eg-text-secondary">
                      {cm.plays.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-eg-text-secondary">
                      {cm.uniqueCompletes.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-eg-text-secondary">
                      {cm.completionRate}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          cm.isActive
                            ? 'bg-eg-success/10 text-eg-success'
                            : 'bg-gray-100 text-eg-text-secondary'
                        }`}
                      >
                        {cm.isActive ? '公開中' : '非公開'}
                      </span>
                    </td>
                  </tr>
                ))}
                {campaignMetrics.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-eg-text-secondary">
                      キャンペーンがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Email Performance */}
      <div className="mt-8">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">
          メール配信状況
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-eg-text-secondary">送信成功</p>
            <p className="mt-1 font-eg-heading text-2xl font-bold text-eg-success">
              {totalEmailsSent.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-eg-text-secondary">送信失敗</p>
            <p className="mt-1 font-eg-heading text-2xl font-bold text-eg-error">
              {totalEmailsFailed.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-eg-text-secondary">成功率</p>
            <p className="mt-1 font-eg-heading text-2xl font-bold text-eg-primary">
              {totalEmailsSent + totalEmailsFailed > 0
                ? ((totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100).toFixed(1)
                : '0.0'}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
