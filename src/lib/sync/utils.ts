import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type SyncLogInsert = Database['public']['Tables']['sync_logs']['Insert']
type SyncLogUpdate = Database['public']['Tables']['sync_logs']['Update']

export async function createSyncLog(
  source: 'gbizinfo' | 'nta',
  syncType: 'full' | 'incremental',
  targetPrefecture?: string
) {
  const supabase = createServiceRoleClient()
  const row: SyncLogInsert = {
    source,
    sync_type: syncType,
    target_prefecture: targetPrefecture || null,
  }
  const { data, error } = await supabase
    .from('sync_logs')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSyncLog(
  id: string,
  update: {
    records_processed?: number
    records_inserted?: number
    records_updated?: number
    records_failed?: number
    status?: 'running' | 'completed' | 'failed' | 'cancelled'
    error_message?: string
  }
) {
  const supabase = createServiceRoleClient()
  const row: SyncLogUpdate = {
    ...update,
    ...(update.status && update.status !== 'running'
      ? { completed_at: new Date().toISOString() }
      : {}),
  }
  const { error } = await supabase
    .from('sync_logs')
    .update(row)
    .eq('id', id)

  if (error) throw error
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Unreachable')
}

export async function batchUpsert<T extends Record<string, unknown>>(
  table: keyof Database['public']['Tables'],
  records: T[],
  conflictColumns: string,
  batchSize = 5000
): Promise<{ inserted: number; updated: number; failed: number }> {
  const supabase = createServiceRoleClient()
  let inserted = 0
  const updated = 0
  let failed = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(table) as any)
        .upsert(batch, { onConflict: conflictColumns })

      if (error) {
        failed += batch.length
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message)
      } else {
        inserted += batch.length
      }
    } catch (err) {
      failed += batch.length
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, err)
    }
  }

  return { inserted, updated, failed }
}
