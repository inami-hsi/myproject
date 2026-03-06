export const PLAN_LIMITS = {
  free: {
    monthlyDownloadRecords: 50,
    maxSavedSearches: 3,
    downloadFormats: ['csv'] as const,
    notifyFrequency: [] as const,
    detailAccess: 'basic' as const,
  },
  starter: {
    monthlyDownloadRecords: 3000,
    maxSavedSearches: 20,
    downloadFormats: ['csv', 'xlsx'] as const,
    notifyFrequency: ['weekly'] as const,
    detailAccess: 'full' as const,
  },
  pro: {
    monthlyDownloadRecords: 30000,
    maxSavedSearches: Infinity,
    downloadFormats: ['csv', 'xlsx'] as const,
    notifyFrequency: ['daily', 'weekly', 'monthly'] as const,
    detailAccess: 'full' as const,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan]
}

export function canDownload(plan: PlanType, currentCount: number, requestedCount: number): boolean {
  const limit = PLAN_LIMITS[plan].monthlyDownloadRecords
  return currentCount + requestedCount <= limit
}

export function getRemainingDownloads(plan: PlanType, currentCount: number): number {
  return Math.max(0, PLAN_LIMITS[plan].monthlyDownloadRecords - currentCount)
}
