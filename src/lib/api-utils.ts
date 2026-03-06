import { NextRequest, NextResponse } from 'next/server'

/**
 * Adds security headers to a NextResponse.
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

/**
 * Validates the CRON_SECRET from the Authorization header.
 *
 * Expects: `Authorization: Bearer <CRON_SECRET>`
 */
export function validateCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

/**
 * Sanitizes search input to prevent SQL injection in free-text search terms.
 *
 * - Removes characters commonly used in SQL injection attacks
 * - Trims whitespace
 * - Limits length to 200 characters
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[;'"\\]/g, '')    // Remove SQL-sensitive characters
    .replace(/--/g, '')         // Remove SQL comment sequences
    .replace(/\/\*/g, '')       // Remove block comment opening
    .replace(/\*\//g, '')       // Remove block comment closing
    .trim()
    .slice(0, 200)
}
