import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/search(.*)',
  '/stats(.*)',
  '/c/(.*)',
  '/api/webhooks/(.*)',
  '/api/cron/(.*)',
  '/api/search(.*)',
  '/api/industries(.*)',
  '/api/regions(.*)',
  '/api/campaigns/(.*)',
  '/api/registrations(.*)',
  '/api/watch/(.*)',
  '/api/events(.*)',
  '/api/checkout/evergreen(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
