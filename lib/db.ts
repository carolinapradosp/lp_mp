// lib/db.ts

import { neon, Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL_PRD;

if (!databaseUrl) {
  throw new Error('A variável DATABASE_URL_PRD não está configurada.');
}

export const sql = neon(databaseUrl);

export const dbPool = new Pool({
  connectionString: databaseUrl,
});
