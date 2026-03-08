import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Untyped service role client for tables not yet in the Database type
 * (e.g., evergreen launch tables). Use this until database.ts is regenerated.
 */
export function createUntypedServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
