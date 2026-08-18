// lib/database/neon.ts

import { neon, Pool } from '@neondatabase/serverless';

const databaseUrl =
  process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL_PRD;

if (!databaseUrl) {
  throw new Error('DATABASE_URL_TEST ou DATABASE_URL_PRD não configurada.');
}

export const sql = neon(databaseUrl);

export const dbPool = new Pool({
  connectionString: databaseUrl,
});
