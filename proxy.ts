import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define admin user ID
const ADMIN_USER_ID = 'user_36jPyz5xU5kK1d9rZJQT2HmGUBp';

// Define protected routes (only these will require authentication)
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Check if user is the admin
    const { userId } = await auth();
    if (userId !== ADMIN_USER_ID) {
      // Redirect non-admin users to homepage
      return NextResponse.redirect(new URL('/', req.url));
    }
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