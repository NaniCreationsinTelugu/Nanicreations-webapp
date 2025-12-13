import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes (only these will require authentication)
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect only admin routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // All other routes are public
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};