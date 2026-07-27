// app/api/products/route.ts

import { getProductsFromDatabase } from '@/lib/products/queries';

export async function GET() {
  try {
    const products = await getProductsFromDatabase();

    return Response.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);

    return Response.json(
      {
        error: 'Erro ao buscar produtos',
      },
      {
        status: 500,
      }
    );
  }
}
