import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET || 'evergreen'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  })
}

/**
 * Upload a video file to R2.
 * Returns the storage path (key).
 */
export async function uploadVideo(
  file: File,
  campaignId?: string
): Promise<{ path: string; error: string | null }> {
  const ext = file.name.split('.').pop() ?? 'mp4'
  const prefix = campaignId ? `videos/campaigns/${campaignId}` : 'videos/uploads'
  const key = `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )
    return { path: key, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return { path: '', error: message }
  }
}

/**
 * Upload a thumbnail image to R2.
 * Returns the public URL.
 */
export async function uploadThumbnail(
  file: File
): Promise<{ url: string; error: string | null }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const key = `thumbnails/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    // Thumbnails are served via R2 public URL or signed URL
    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : await getVideoSignedUrl(key, 86400 * 365) ?? ''

    return { url, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return { url: '', error: message }
  }
}

/**
 * Get a signed URL for a file (time-limited access).
 */
export async function getVideoSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  try {
    const url = await getSignedUrl(
      getR2Client(),
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: storagePath,
      }),
      { expiresIn: expiresInSeconds }
    )
    return url
  } catch (err) {
    console.error('Signed URL error:', err)
    return null
  }
}

/**
 * Generate a presigned URL for direct upload to R2.
 * Client uploads directly to R2, bypassing Vercel's 4.5MB body limit.
 */
export async function getUploadPresignedUrl(
  filename: string,
  contentType: string,
  campaignId?: string
): Promise<{ url: string; key: string; error: string | null }> {
  const ext = filename.split('.').pop() ?? 'mp4'
  const prefix = campaignId ? `videos/campaigns/${campaignId}` : 'videos/uploads'
  const key = `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  try {
    const url = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 3600 }
    )
    return { url, key, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Presign failed'
    return { url: '', key: '', error: message }
  }
}

/**
 * Delete a file from R2.
 */
export async function deleteVideo(storagePath: string): Promise<boolean> {
  try {
    await getR2Client().send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: storagePath,
      })
    )
    return true
  } catch {
    return false
  }
}

/**
 * Configure CORS on R2 bucket for direct browser uploads.
 */
export async function configureBucketCors(allowedOrigin: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await getR2Client().send(
      new PutBucketCorsCommand({
        Bucket: R2_BUCKET,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: [allowedOrigin],
              AllowedMethods: ['PUT', 'GET'],
              AllowedHeaders: ['Content-Type'],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    )
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'CORS config failed' }
  }
}

/**
 * Get current CORS configuration.
 */
export async function getBucketCors(): Promise<{ rules: unknown; error: string | null }> {
  try {
    const result = await getR2Client().send(
      new GetBucketCorsCommand({ Bucket: R2_BUCKET })
    )
    return { rules: result.CORSRules, error: null }
  } catch (err) {
    return { rules: null, error: err instanceof Error ? err.message : 'Failed to get CORS' }
  }
}
