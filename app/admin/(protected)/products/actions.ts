// app/admin/(protected)/products/actions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { verifyAdminSession } from '@/lib/auth/admin-session';
import { sql } from '@/lib/database/neon';

import type { PricingRule } from '@/interfaces/Product';

export type ProductFormErrors = {
  title?: string;
  description?: string;
  base_price?: string;
  image_url?: string;
  stock?: string;
  pricing_rules?: string;
};

export type ProductFormState = {
  success: boolean;
  message: string;
  errors?: ProductFormErrors;
};

type CreatedProductRow = {
  id: string;
};

function parseCurrency(value: FormDataEntryValue | null): number {
  const normalizedValue = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  return Number(normalizedValue);
}

function parsePricingRules(value: FormDataEntryValue | null): PricingRule[] {
  if (!value) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(String(value));

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((rule) => {
        if (
          typeof rule !== 'object' ||
          rule === null ||
          !('min_quantity' in rule) ||
          !('unit_price' in rule)
        ) {
          return null;
        }

        const minQuantity = Number(rule.min_quantity);
        const unitPrice = Number(rule.unit_price);

        if (
          !Number.isInteger(minQuantity) ||
          minQuantity < 2 ||
          !Number.isFinite(unitPrice) ||
          unitPrice <= 0
        ) {
          return null;
        }

        return {
          min_quantity: minQuantity,
          unit_price: unitPrice,
        };
      })
      .filter((rule): rule is PricingRule => rule !== null);
  } catch {
    return [];
  }
}

function hasDuplicatedQuantities(pricingRules: PricingRule[]): boolean {
  const quantities = pricingRules.map((rule) => rule.min_quantity);

  return new Set(quantities).size !== quantities.length;
}

export async function createProduct(
  previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  void previousState;

  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    return {
      success: false,
      message: 'Você não tem permissão para cadastrar produtos.',
    };
  }

  const title = String(formData.get('title') ?? '').trim();

  const description = String(formData.get('description') ?? '').trim();

  const imageUrl = String(formData.get('image_url') ?? '').trim();

  const basePrice = parseCurrency(formData.get('base_price'));

  const stock = Number(formData.get('stock'));

  const active = formData.get('active') === 'on';

  const pricingRules = parsePricingRules(formData.get('pricing_rules'));

  const errors: ProductFormErrors = {};

  if (!title) {
    errors.title = 'Informe o nome do produto.';
  }

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    errors.base_price = 'Informe um preço válido.';
  }

  if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = 'Informe um estoque válido.';
  }

  if (imageUrl) {
    try {
      new URL(imageUrl);
    } catch {
      errors.image_url = 'Informe uma URL válida.';
    }
  }

  if (hasDuplicatedQuantities(pricingRules)) {
    errors.pricing_rules = 'Não repita a mesma quantidade mínima.';
  }

  const hasInvalidPricingRule = pricingRules.some(
    (rule) => rule.unit_price >= basePrice
  );

  if (hasInvalidPricingRule) {
    errors.pricing_rules =
      'O preço progressivo deve ser menor que o preço base.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Verifique os campos do formulário.',
      errors,
    };
  }

  let productId: string | null = null;

  try {
    const createdProducts = await sql`
            INSERT INTO public.products (
                title,
                description,
                base_price,
                image_url,
                stock,
                active,
                created_at,
                updated_at
            )
            VALUES (
                ${title},
                ${description || null},
                ${basePrice},
                ${imageUrl || null},
                ${stock},
                ${active},
                NOW(),
                NOW()
            )
            RETURNING id
        `;

    productId = (createdProducts as CreatedProductRow[])[0]?.id;

    if (!productId) {
      throw new Error('O banco não retornou o ID do produto.');
    }

    const sortedPricingRules = [...pricingRules].sort(
      (firstRule, secondRule) =>
        firstRule.min_quantity - secondRule.min_quantity
    );

    for (const rule of sortedPricingRules) {
      await sql`
                INSERT INTO public.product_pricing_rules (
                    product_id,
                    min_quantity,
                    unit_price,
                    active,
                    created_at
                )
                VALUES (
                    ${productId},
                    ${rule.min_quantity},
                    ${rule.unit_price},
                    true,
                    NOW()
                )
            `;
    }
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);

    if (productId) {
      try {
        await sql`
                    DELETE FROM public.product_pricing_rules
                    WHERE product_id = ${productId}
                `;

        await sql`
                    DELETE FROM public.products
                    WHERE id = ${productId}
                `;
      } catch (rollbackError) {
        console.error('Erro ao desfazer cadastro do produto:', rollbackError);
      }
    }

    return {
      success: false,
      message: 'Não foi possível cadastrar o produto. Tente novamente.',
    };
  }

  revalidatePath('/');
  revalidatePath('/admin/products');

  redirect('/admin/products');
}

export async function toggleProductStatus(formData: FormData): Promise<void> {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect('/admin');
  }

  const productId = String(formData.get('product_id') ?? '');

  const currentStatus = formData.get('current_status') === 'true';

  if (!productId) {
    return;
  }

  try {
    await sql`
            UPDATE public.products
            SET
                active = ${!currentStatus},
                updated_at = NOW()
            WHERE id = ${productId}
        `;

    revalidatePath('/');
    revalidatePath('/admin/products');
  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);
  }
}
