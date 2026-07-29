// lib/auth/credentials.ts

import 'server-only';

import { timingSafeEqual } from 'node:crypto';

function safeCompare(providedValue: string, expectedValue: string) {
  const providedBuffer = Buffer.from(providedValue);
  const expectedBuffer = Buffer.from(expectedValue);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function validateAdminCredentials(username: string, password: string) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error('As credenciais administrativas não foram configuradas.');
  }

  const validUsername = safeCompare(username, adminUsername);

  const validPassword = safeCompare(password, adminPassword);

  return validUsername && validPassword;
}
