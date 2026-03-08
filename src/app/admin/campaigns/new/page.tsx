import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { CampaignForm } from '../campaign-form'

export default async function NewCampaignPage() {
  const supabase = createServiceRoleClient()

  const { data: videos } = await supabase
    .from('videos')
    .select('id, title')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-eg-heading text-2xl font-bold text-eg-primary">
        新規キャンペーン作成
      </h1>
      <div className="mt-6">
        <CampaignForm videos={videos ?? []} />
      </div>
    </div>
  )
}
