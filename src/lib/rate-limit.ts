/**
 * Simple in-memory rate limiter using Map with TTL cleanup.
 *
 * Not suitable for multi-instance deployments (use Redis in that case).
 * Sufficient for single-instance / serverless-with-warm-start scenarios.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup of expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupTimer() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        store.delete(key)
      }
    })
  }, CLEANUP_INTERVAL_MS)
  // Allow the Node.js process to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean
  /** Number of remaining requests in this window */
  remaining: number
  /** Unix timestamp (ms) when the window resets */
  reset: number
}

/**
 * Check rate limit for a given identifier.
 *
 * @param identifier - Unique key (e.g. userId, IP)
 * @param limit      - Max number of requests per window
 * @param windowMs   - Window duration in milliseconds
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  ensureCleanupTimer()

  const now = Date.now()
  const entry = store.get(identifier)

  // If no entry or window expired, create a new window
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, reset: resetAt }
  }

  // Window is still active
  entry.count += 1

  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt }
  }

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  }
}
