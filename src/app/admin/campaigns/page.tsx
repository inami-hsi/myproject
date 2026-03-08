import Link from 'next/link'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export default async function CampaignsPage() {
  const supabase = createServiceRoleClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, registrations(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-eg-heading text-2xl font-bold text-eg-primary">
          キャンペーン
        </h1>
        <Link
          href="/admin/campaigns/new"
          className="rounded-lg bg-eg-accent px-4 py-2 font-eg-heading text-sm font-semibold text-white hover:bg-eg-accent/90"
        >
          新規作成
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {(campaigns ?? []).map((campaign) => {
          const regCount = (campaign.registrations as { count: number }[])?.[0]?.count ?? 0
          return (
            <Link
              key={campaign.id}
              href={`/admin/campaigns/${campaign.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="font-eg-heading text-lg font-semibold text-eg-primary">
                  {campaign.name}
                </h3>
                <p className="mt-1 text-sm text-eg-text-secondary">
                  /{campaign.slug} &middot; 登録者 {regCount}人
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    campaign.is_active
                      ? 'bg-eg-success/10 text-eg-success'
                      : 'bg-gray-100 text-eg-text-secondary'
                  }`}
                >
                  {campaign.is_active ? '有効' : '無効'}
                </span>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )
        })}
        {(campaigns ?? []).length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-eg-text-secondary">キャンペーンがありません</p>
            <Link
              href="/admin/campaigns/new"
              className="mt-4 inline-block rounded-lg bg-eg-accent px-6 py-2 font-eg-heading text-sm font-semibold text-white hover:bg-eg-accent/90"
            >
              最初のキャンペーンを作成
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
