// lib/products/queries.ts

import 'server-only';

import { sql } from '@/lib/database/neon';

import type { AdminProduct, PricingRule, Product } from '@/interfaces/Product';

type PricingRuleDatabaseRow = {
  min_quantity: string | number;
  unit_price: string | number;
};

type ProductDatabaseRow = {
  id: string;
  title: string;
  description: string | null;
  base_price: string | number;
  image_url: string | null;
  stock: string | number;
  pricing_rules: PricingRuleDatabaseRow[] | null;
};

type AdminProductDatabaseRow = ProductDatabaseRow & {
  active: boolean;
  created_at: string | Date;
  updated_at: string | Date | null;
};

function normalizePricingRules(
  pricingRules: PricingRuleDatabaseRow[] | null
): PricingRule[] {
  if (!Array.isArray(pricingRules)) {
    return [];
  }

  return pricingRules.map((rule) => ({
    min_quantity: Number(rule.min_quantity),
    unit_price: Number(rule.unit_price),
  }));
}

function normalizeProduct(row: ProductDatabaseRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    base_price: Number(row.base_price),
    image_url: row.image_url ?? '',
    stock: Number(row.stock),
    pricing_rules: normalizePricingRules(row.pricing_rules),
  };
}

function normalizeAdminProduct(row: AdminProductDatabaseRow): AdminProduct {
  return {
    ...normalizeProduct(row),
    active: row.active,
    created_at: new Date(row.created_at),
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

/**
 * Produtos exibidos na landing page.
 *
 * Retorna somente produtos ativos e regras de preço ativas.
 */
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

/**
 * Produtos exibidos na área administrativa.
 *
 * Retorna produtos ativos e inativos.
 */
export async function getAdminProductsFromDatabase(): Promise<AdminProduct[]> {
  const products = await sql`
        SELECT
            p.id,
            p.title,
            p.description,
            p.base_price,
            p.image_url,
            p.stock,
            p.active,
            p.created_at,
            p.updated_at,

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

        GROUP BY p.id

        ORDER BY p.created_at DESC
    `;

  return (products as AdminProductDatabaseRow[]).map(normalizeAdminProduct);
}

/**
 * Produto específico para edição.
 */
export async function getAdminProductById(
  productId: string
): Promise<AdminProduct | null> {
  const products = await sql`
        SELECT
            p.id,
            p.title,
            p.description,
            p.base_price,
            p.image_url,
            p.stock,
            p.active,
            p.created_at,
            p.updated_at,

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

        WHERE p.id = ${productId}

        GROUP BY p.id

        LIMIT 1
    `;

  const product = (products as AdminProductDatabaseRow[])[0];

  if (!product) {
    return null;
  }

  return normalizeAdminProduct(product);
}
