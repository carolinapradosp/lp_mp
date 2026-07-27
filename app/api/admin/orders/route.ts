// app/api/admin/orders/route.ts

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-session';
import { getOrdersFromDatabase } from '@/lib/orders/queries';

export async function GET(request: Request) {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    return NextResponse.json(
      {
        error: 'Não autorizado',
      },
      {
        status: 401,
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const result = await getOrdersFromDatabase({
      orderId: searchParams.get('orderId') ?? '',
      cpf: searchParams.get('cpf') ?? '',
      email: searchParams.get('email') ?? '',
      status: searchParams.get('status') ?? '',
      limit: Number(searchParams.get('limit')) || 50,
      offset: Number(searchParams.get('offset')) || 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);

    return NextResponse.json(
      {
        error: 'Erro ao buscar pedidos',
      },
      {
        status: 500,
      }
    );
  }
}
