import 'server-only';

import { sql } from '@/lib/database/neon';
import type { Product, PricingRule } from '@/interfaces/Product';

type ProductDatabaseRow = {
  id: Product['id'];
  title: string;
  description: string | null;
  base_price: string | number;
  image_url: string;
  stock: string | number;
  pricing_rules: Array<{
    min_quantity: string | number;
    unit_price: string | number;
  }> | null;
};

function normalizeProduct(row: ProductDatabaseRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    base_price: Number(row.base_price),
    image_url: row.image_url,
    stock: Number(row.stock),
    pricing_rules: Array.isArray(row.pricing_rules)
      ? row.pricing_rules.map((rule) => ({
          min_quantity: Number(rule.min_quantity),
          unit_price: Number(rule.unit_price),
        }))
      : [],
  };
}

export async function getProductsFromDatabase(): Promise<Product[]> {
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
      ) AS pricing_rules

    FROM public.products p

    LEFT JOIN public.product_pricing_rules pr
      ON pr.product_id = p.id
      AND pr.active = true

    WHERE p.active = true

    GROUP BY p.id

    ORDER BY p.title ASC
  `;

  return (products as ProductDatabaseRow[]).map(normalizeProduct);
}
