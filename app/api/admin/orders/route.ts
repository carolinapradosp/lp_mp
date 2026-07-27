// app/api/admin/orders/route.ts

import { getOrdersFromDatabase } from '@/lib/orders/queries';

export async function GET(request: Request) {
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

    return Response.json(result);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);

    return Response.json(
      {
        error: 'Erro ao buscar pedidos',
      },
      {
        status: 500,
      }
    );
  }
}
