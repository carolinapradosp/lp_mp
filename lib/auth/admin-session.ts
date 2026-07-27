// lib/auth/admin-session.ts

import 'server-only';

import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const COOKIE_NAME = 'admin-session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error('A variável ADMIN_SESSION_SECRET não foi configurada.');
  }

  return new TextEncoder().encode(secret);
}

type AdminSessionPayload = {
  role: 'admin';
};

export async function createAdminSession() {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  const token = await new SignJWT({
    role: 'admin',
  } satisfies AdminSessionPayload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setIssuer('lp-mp')
    .setAudience('lp-mp-admin')
    .sign(getSessionSecret());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: 'lp-mp',
      audience: 'lp-mp-admin',
    });

    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
