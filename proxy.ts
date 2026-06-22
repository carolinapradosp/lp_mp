import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite acesso à tela de login
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.next();
  }

  // Protege rotas administrativas
  if (pathname.startsWith('/admin')) {
    const adminAuth = request.cookies.get('admin-auth');

    if (!adminAuth) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
