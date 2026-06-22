// app/api/products/route.ts

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_PRD!);

export async function GET() {
  try {
    const products = await sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.base_price,
        p.image_url,
        p.stock,

        COALESCE(
          json_agg(
            json_build_object(
              'min_quantity', pr.min_quantity,
              'unit_price', pr.unit_price
            )
            ORDER BY pr.min_quantity ASC
          ) FILTER (WHERE pr.id IS NOT NULL),
          '[]'
        ) as pricing_rules

      FROM products p

      LEFT JOIN product_pricing_rules pr
        ON pr.product_id = p.id
        AND pr.active = true

      WHERE p.active = true

      GROUP BY p.id

      ORDER BY p.created_at ASC
    `;

    return Response.json(products);
  } catch (error) {
    console.error(error);

    return Response.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}
