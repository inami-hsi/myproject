import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'evergreen-videos'
const THUMBNAIL_BUCKET = 'evergreen-thumbnails'

/**
 * Ensure the storage buckets exist.
 * Called once on first upload.
 */
export async function ensureBuckets() {
  const supabase = createServiceRoleClient()

  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketNames = (buckets ?? []).map((b) => b.name)

  if (!bucketNames.includes(BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 500 * 1024 * 1024, // 500MB
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    })
  }

  if (!bucketNames.includes(THUMBNAIL_BUCKET)) {
    await supabase.storage.createBucket(THUMBNAIL_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    })
  }
}

/**
 * Upload a video file to Supabase Storage.
 * Returns the storage path (not the full URL).
 */
export async function uploadVideo(
  file: File,
  campaignId?: string
): Promise<{ path: string; error: string | null }> {
  const supabase = createServiceRoleClient()
  await ensureBuckets()

  const ext = file.name.split('.').pop() ?? 'mp4'
  const prefix = campaignId ? `campaigns/${campaignId}` : 'uploads'
  const path = `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return { path: '', error: error.message }
  }

  return { path, error: null }
}

/**
 * Upload a thumbnail image.
 * Returns the public URL.
 */
export async function uploadThumbnail(
  file: File
): Promise<{ url: string; error: string | null }> {
  const supabase = createServiceRoleClient()
  await ensureBuckets()

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `thumbnails/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return { url: '', error: error.message }
  }

  const { data } = supabase.storage
    .from(THUMBNAIL_BUCKET)
    .getPublicUrl(path)

  return { url: data.publicUrl, error: null }
}

/**
 * Get a signed URL for a video (time-limited access).
 */
export async function getVideoSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error) {
    console.error('Signed URL error:', error)
    return null
  }

  return data.signedUrl
}

/**
 * Delete a video from storage.
 */
export async function deleteVideo(storagePath: string): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath])

  return !error
}
