// lib/database/neon.ts

import { neon } from '@neondatabase/serverless';

const databaseUrl =
  process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL_PRD;

if (!databaseUrl) {
  throw new Error('Database connection string is not configured.');
}

export const sql = neon(databaseUrl);
