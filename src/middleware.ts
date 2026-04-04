import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that do not require authentication
const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API routes or static files don't need this middleware interception usually,
  // but just in case, let's ignore _next and api routes.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') // static assets
  ) {
    return NextResponse.next();
  }

  // Check if we have an access_token cookie
  const token = request.cookies.get('access_token')?.value;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isAuthRoute;

  // FORCE BYPASS for auth routes: 
  // If we are on a login/forgot/reset page, JUST LET THEM IN.
  // No token checks, no redirects. This is the absolute bypass.
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // If user is trying to access a protected route without a token
  if (!token && !isPublicRoute) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
