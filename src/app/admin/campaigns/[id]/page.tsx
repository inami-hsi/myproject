import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { CampaignForm } from '../campaign-form'
import { DuplicateButton } from './duplicate-button'
import type { Campaign } from '@/types/evergreen'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !campaign) notFound()

  const [videosResult, registrationsResult, emailTemplatesResult] = await Promise.all([
    supabase.from('videos').select('id, title').order('created_at', { ascending: false }),
    supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', id),
    supabase
      .from('email_templates')
      .select('id, trigger_type, subject, is_active')
      .eq('campaign_id', id)
      .order('delay_minutes', { ascending: true }),
  ])

  const triggerLabels: Record<string, string> = {
    confirmation: '登録確認',
    reminder_24h: '24時間前リマインダー',
    reminder_1h: '1時間前リマインダー',
    start: '開始通知',
    followup: 'フォローアップ',
    replay: 'リプレイ案内',
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/campaigns" className="text-sm text-eg-text-secondary hover:text-eg-accent">
            &larr; キャンペーン一覧
          </Link>
          <h1 className="mt-1 font-eg-heading text-2xl font-bold text-eg-primary">
            {campaign.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DuplicateButton campaignId={id} />
          {campaign.is_active && (
            <a
              href={`/c/${campaign.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-eg-text-secondary hover:bg-gray-50"
            >
              LPを確認
            </a>
          )}
          <Link
            href={`/admin/campaigns/${id}/registrations`}
            className="text-sm text-eg-accent hover:text-eg-accent/80"
          >
            登録者: {registrationsResult.count ?? 0}人 &rarr;
          </Link>
        </div>
      </div>

      {/* Email Templates Summary */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">メールテンプレート</h2>
          <Link
            href={`/admin/campaigns/${id}/emails`}
            className="text-sm font-medium text-eg-accent hover:text-eg-accent/80"
          >
            編集
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(emailTemplatesResult.data ?? []).map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-eg-text-primary">
                  {triggerLabels[tpl.trigger_type] ?? tpl.trigger_type}
                </p>
                <p className="text-xs text-eg-text-secondary truncate max-w-48">{tpl.subject}</p>
              </div>
              <span
                className={`h-2 w-2 rounded-full ${tpl.is_active ? 'bg-eg-success' : 'bg-gray-300'}`}
                title={tpl.is_active ? '有効' : '無効'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Edit Form */}
      <CampaignForm
        videos={videosResult.data ?? []}
        campaign={campaign as Campaign}
      />
    </div>
  )
}
