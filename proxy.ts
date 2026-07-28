// proxy.ts

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin-session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Permite acesso à tela de login.
   */
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.next();
  }

  /*
   * Protege as demais rotas administrativas.
   */
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
