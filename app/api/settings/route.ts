// app/api/settings/route.ts

import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/settings/queries';

export async function GET() {
  try {
    const settings = await getPublicSettings();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro interno.',
      },
      {
        status: 500,
      }
    );
  }
}
