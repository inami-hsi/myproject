import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { EmailTemplateEditor } from './email-template-editor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EmailTemplatesPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const [campaignResult, templatesResult] = await Promise.all([
    supabase.from('campaigns').select('id, name, slug').eq('id', id).single(),
    supabase
      .from('email_templates')
      .select('*')
      .eq('campaign_id', id)
      .order('delay_minutes', { ascending: true }),
  ])

  if (!campaignResult.data) notFound()

  const campaign = campaignResult.data
  const templates = templatesResult.data ?? []

  return (
    <div>
      <Link href={`/admin/campaigns/${id}`} className="text-sm text-eg-text-secondary hover:text-eg-accent">
        &larr; {campaign.name}
      </Link>
      <h1 className="mt-1 font-eg-heading text-2xl font-bold text-eg-primary">
        メールテンプレート
      </h1>
      <p className="mt-1 text-sm text-eg-text-secondary">
        各メールの件名・本文を編集できます。プレースホルダー:
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-xs">{'{{name}}'}</code>
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-xs">{'{{session_date}}'}</code>
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-xs">{'{{watch_url}}'}</code>
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-xs">{'{{campaign_name}}'}</code>
      </p>

      <div className="mt-6 space-y-4">
        {templates.map((template) => (
          <EmailTemplateEditor key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
