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
    
    // If logged in as admin and trying to access admin login
    if (systemToken && isAdminAuthRoute) {
      return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    }

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
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
