import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSession = request.cookies.get('admin_session');

  // Allow these paths without authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Skip middleware for static assets and public files
  const isAsset = pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/api');

  if (isPublicPath || isAsset) {
    return NextResponse.next();
  }

  if (!adminSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preserve the original destination
    if (pathname !== '/') {
      url.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
