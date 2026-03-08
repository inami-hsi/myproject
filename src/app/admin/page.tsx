import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createServiceRoleClient()

  const [campaignsResult, registrationsResult, viewsResult] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('registrations').select('id', { count: 'exact', head: true }),
    supabase.from('view_events').select('id', { count: 'exact', head: true }).eq('event_type', 'complete'),
  ])

  const stats = [
    { label: 'キャンペーン数', value: campaignsResult.count ?? 0 },
    { label: '総登録者数', value: registrationsResult.count ?? 0 },
    { label: '視聴完了数', value: viewsResult.count ?? 0 },
  ]

  // Recent registrations
  const { data: recentRegistrations } = await supabase
    .from('registrations')
    .select('id, name, email, registered_at, campaigns(name)')
    .order('registered_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <h1 className="font-eg-heading text-2xl font-bold text-eg-primary">
        ダッシュボード
      </h1>

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <p className="text-sm font-medium text-eg-text-secondary">{stat.label}</p>
            <p className="mt-2 font-eg-heading text-3xl font-bold text-eg-primary">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Registrations */}
      <div className="mt-8">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">
          最近の登録者
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">名前</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">メール</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">キャンペーン</th>
                <th className="px-4 py-3 text-left font-medium text-eg-text-secondary">登録日時</th>
              </tr>
            </thead>
            <tbody>
              {(recentRegistrations ?? []).map((reg) => (
                <tr key={reg.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-eg-text-primary">{reg.name}</td>
                  <td className="px-4 py-3 text-eg-text-secondary">{reg.email}</td>
                  <td className="px-4 py-3 text-eg-text-secondary">
                    {((reg.campaigns as unknown as { name: string }[] | null)?.[0]?.name) ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-eg-text-secondary">
                    {new Date(reg.registered_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                  </td>
                </tr>
              ))}
              {(recentRegistrations ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-eg-text-secondary">
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
