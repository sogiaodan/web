import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that do not require authentication
const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API routes or static files don't need this middleware interception usually,
  // but just in case, let's ignore _next and api routes.
  // ── STATIC ASSET PROTECTION ──────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/brand') || // manifest and icons
    pathname.endsWith('.json') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Check for tokens
  const token = request.cookies.get('access_token')?.value;
  const systemToken = request.cookies.get('system_token')?.value;

  // ── SUPER ADMIN PROTECTION ──────────────────────────────────────────
  if (pathname.startsWith('/super-admin')) {
    const isAdminAuthRoute = pathname === '/super-admin/login';
    
    // If trying to access admin dashboard without system token
    if (!systemToken && !isAdminAuthRoute) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    
    /* 
       Wait: We disable the auto-redirect to dashboard to prevent infinite loops 
       if the token in the cookie is invalid (e.g. after a DB reset). 
       The client-side provider will handle the "Already logged in" redirect if needed.
    */
    /*
    if (systemToken && isAdminAuthRoute) {
      return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    }
    */

    return NextResponse.next();
  }

  // ── REGULAR USER PROTECTION ──────────────────────────────────────────
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isAuthRoute;

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (!token && !isPublicRoute) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except absolute statics
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)'],
};
