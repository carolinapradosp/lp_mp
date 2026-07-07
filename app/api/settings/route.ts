// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_PRD!);

export async function GET() {
  try {
    const settings = await sql`
      SELECT key, value
      FROM system_settings
    `;

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
