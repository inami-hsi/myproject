import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { VideoUploadForm } from './video-upload-form'
import { VideoDeleteButton } from './video-delete-button'

export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  const supabase = createServiceRoleClient()

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-eg-heading text-2xl font-bold text-eg-primary">
        動画管理
      </h1>

      {/* Upload Form */}
      <div className="mt-6">
        <VideoUploadForm />
      </div>

      {/* Video List */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(videos ?? []).map((video) => (
          <div
            key={video.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-100">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-eg-heading font-semibold text-eg-primary">
                {video.title}
              </h3>
              {video.description && (
                <p className="mt-1 text-sm text-eg-text-secondary line-clamp-2">
                  {video.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-eg-text-secondary">
                <span>
                  {video.duration_seconds
                    ? `${Math.floor(video.duration_seconds / 60)}分${video.duration_seconds % 60}秒`
                    : '長さ未設定'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    video.is_public
                      ? 'bg-eg-success/10 text-eg-success'
                      : 'bg-gray-100 text-eg-text-secondary'
                  }`}
                >
                  {video.is_public ? '公開' : '非公開'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-eg-text-secondary">
                  {new Date(video.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                </p>
                <VideoDeleteButton videoId={video.id} videoTitle={video.title} />
              </div>
            </div>
          </div>
        ))}
        {(videos ?? []).length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-eg-text-secondary">まだ動画がアップロードされていません</p>
            <p className="mt-1 text-sm text-eg-text-secondary">上のフォームから動画をアップロードしてください</p>
          </div>
        )}
      </div>
    </div>
  )
}
