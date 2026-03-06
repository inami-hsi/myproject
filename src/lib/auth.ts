import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  return data
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function getClerkProfile() {
  const user = await currentUser()
  if (!user) return null
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  }
}

// Legacy TaskFlow compatibility stubs
export interface UserProfileData {
  age?: number
  gender?: string
  phone?: string
  occupation?: string
  children?: number
  spouse?: boolean
  prefecture?: string
  existingInsurance?: boolean
}

export async function getOrCreateDemoUser() {
  return getCurrentUser()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateUserProfile(userId: string, data: UserProfileData) {
  // No-op: profile fields moved to Clerk metadata
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function logComplianceAction(action: string, userId: string, details?: Record<string, unknown>) {
  // No-op: compliance logging not yet implemented with Clerk
}
