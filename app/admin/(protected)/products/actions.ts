// app/admin/(protected)/products/actions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { del } from '@vercel/blob';

import type { PricingRule } from '@/interfaces/Product';
import { verifyAdminSession } from '@/lib/auth/admin-session';
import { sql } from '@/lib/database/neon';

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

type ExistingProductRow = {
  id: string;
};

type ParsedProductFormData = {
  productId: string;
  title: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  active: boolean;
  pricingRules: PricingRule[];
};

export type DeleteProductState = {
  success: boolean;
  message: string;
};

type ProductToDeleteRow = {
  id: string;
  image_url: string | null;
};

type ProductOrderReferenceRow = {
  has_orders: boolean;
};

function isVercelBlobUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

function parseCurrency(value: FormDataEntryValue | null): number {
  const originalValue = String(value ?? '')
    .trim()
    .replace(/\s/g, '');

  if (!originalValue) {
    return Number.NaN;
  }

  /*
   * Formato brasileiro:
   * 1.149,90 -> 1149.90
   */
  if (originalValue.includes('.') && originalValue.includes(',')) {
    return Number(originalValue.replace(/\./g, '').replace(',', '.'));
  }

  /*
   * Apenas vírgula:
   * 1149,90 -> 1149.90
   */
  if (originalValue.includes(',')) {
    return Number(originalValue.replace(',', '.'));
  }

  /*
   * Apenas ponto:
   * 1149.90 -> 1149.90
   */
  return Number(originalValue);
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
      .map((rule): PricingRule | null => {
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
      .filter((rule): rule is PricingRule => rule !== null)
      .sort(
        (firstRule, secondRule) =>
          firstRule.min_quantity - secondRule.min_quantity
      );
  } catch {
    return [];
  }
}

function getProductFormData(formData: FormData): ParsedProductFormData {
  return {
    productId: String(formData.get('product_id') ?? '').trim(),

    title: String(formData.get('title') ?? '').trim(),

    description: String(formData.get('description') ?? '').trim(),

    basePrice: parseCurrency(formData.get('base_price')),

    imageUrl: String(formData.get('image_url') ?? '').trim(),

    stock: Number(formData.get('stock')),

    active: formData.get('active') === 'on',

    pricingRules: parsePricingRules(formData.get('pricing_rules')),
  };
}

function validateProductData({
  title,
  basePrice,
  imageUrl,
  stock,
  pricingRules,
}: ParsedProductFormData): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!title) {
    errors.title = 'Informe o nome do produto.';
  }

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    errors.base_price = 'Informe um preço válido.';
  }

  if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = 'Informe uma quantidade de estoque válida.';
  }

  if (imageUrl) {
    try {
      new URL(imageUrl);
    } catch {
      errors.image_url = 'Informe uma URL de imagem válida.';
    }
  }

  const quantities = pricingRules.map((rule) => rule.min_quantity);

  const hasDuplicatedQuantities =
    new Set(quantities).size !== quantities.length;

  if (hasDuplicatedQuantities) {
    errors.pricing_rules = 'Não repita a mesma quantidade mínima.';
  }

  const hasPriceGreaterThanBase = pricingRules.some(
    (rule) => rule.unit_price >= basePrice
  );

  if (hasPriceGreaterThanBase) {
    errors.pricing_rules =
      'O preço progressivo deve ser menor que o preço base.';
  }

  for (let index = 1; index < pricingRules.length; index += 1) {
    const previousRule = pricingRules[index - 1];
    const currentRule = pricingRules[index];

    if (currentRule.unit_price >= previousRule.unit_price) {
      errors.pricing_rules =
        'O preço unitário deve diminuir conforme a quantidade aumenta.';

      break;
    }
  }

  return errors;
}

async function insertPricingRules(
  productId: string,
  pricingRules: PricingRule[]
): Promise<void> {
  for (const rule of pricingRules) {
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

  const productData = getProductFormData(formData);
  const errors = validateProductData(productData);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Verifique os campos do formulário.',
      errors,
    };
  }

  let createdProductId: string | null = null;

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
                ${productData.title},
                ${productData.description || null},
                ${productData.basePrice},
                ${productData.imageUrl || null},
                ${productData.stock},
                ${productData.active},
                NOW(),
                NOW()
            )
            RETURNING id
        `;

    createdProductId = (createdProducts as CreatedProductRow[])[0]?.id;

    if (!createdProductId) {
      throw new Error('O banco não retornou o ID do produto.');
    }

    await insertPricingRules(createdProductId, productData.pricingRules);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);

    /*
     * Remove o produto caso alguma regra tenha falhado
     * durante o cadastro.
     */
    if (createdProductId) {
      try {
        await sql`
                    DELETE FROM public.product_pricing_rules
                    WHERE product_id = ${createdProductId}
                `;

        await sql`
                    DELETE FROM public.products
                    WHERE id = ${createdProductId}
                `;
      } catch (rollbackError) {
        console.error('Erro ao desfazer cadastro:', rollbackError);
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

export async function updateProduct(
  previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  void previousState;

  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    return {
      success: false,
      message: 'Você não tem permissão para editar produtos.',
    };
  }

  const productData = getProductFormData(formData);

  const previousImageUrl = String(
    formData.get('previous_image_url') ?? ''
  ).trim();

  if (!productData.productId) {
    return {
      success: false,
      message: 'Produto não identificado.',
    };
  }

  const errors = validateProductData(productData);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Verifique os campos do formulário.',
      errors,
    };
  }

  try {
    const existingProducts = await sql`
            SELECT id
            FROM public.products
            WHERE id = ${productData.productId}
            LIMIT 1
        `;

    const existingProduct = (existingProducts as ExistingProductRow[])[0];

    if (!existingProduct) {
      return {
        success: false,
        message: 'Produto não encontrado.',
      };
    }

    await sql`
            UPDATE public.products
            SET
                title = ${productData.title},
                description = ${productData.description || null},
                base_price = ${productData.basePrice},
                image_url = ${productData.imageUrl || null},
                stock = ${productData.stock},
                active = ${productData.active},
                updated_at = NOW()
            WHERE id = ${productData.productId}
        `;

    /*
     * As regras enviadas pelo formulário passam a ser
     * a versão atual das regras do produto.
     */
    await sql`
            DELETE FROM public.product_pricing_rules
            WHERE product_id = ${productData.productId}
        `;

    await insertPricingRules(productData.productId, productData.pricingRules);

    const imageWasChanged =
      previousImageUrl &&
      previousImageUrl !== productData.imageUrl &&
      isVercelBlobUrl(previousImageUrl);

    if (imageWasChanged) {
      try {
        await del(previousImageUrl);
      } catch (deleteImageError) {
        console.error(
          'Produto atualizado, mas não foi possível excluir a imagem antiga:',
          deleteImageError
        );
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);

    return {
      success: false,
      message: 'Não foi possível atualizar o produto. Tente novamente.',
    };
  }

  revalidatePath('/');
  revalidatePath('/admin/products');

  revalidatePath(`/admin/products/${productData.productId}/edit`);

  redirect('/admin/products');
}

export async function toggleProductStatus(formData: FormData): Promise<void> {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect('/admin');
  }

  const productId = String(formData.get('product_id') ?? '').trim();

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
  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);

    return;
  }

  revalidatePath('/');
  revalidatePath('/admin/products');
}

export async function deleteProduct(
  previousState: DeleteProductState,
  formData: FormData
): Promise<DeleteProductState> {
  void previousState;

  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    return {
      success: false,
      message: 'Você não tem permissão para excluir produtos.',
    };
  }

  const productId = String(formData.get('product_id') ?? '').trim();

  if (!productId) {
    return {
      success: false,
      message: 'Produto não identificado.',
    };
  }

  try {
    const products = await sql`
            SELECT
                id,
                image_url
            FROM public.products
            WHERE id = ${productId}
            LIMIT 1
        `;

    const product = (products as ProductToDeleteRow[])[0];

    if (!product) {
      return {
        success: false,
        message: 'Produto não encontrado.',
      };
    }

    /*
     * Não permite excluir um produto que já faz parte
     * do histórico de pedidos.
     */
    const references = await sql`
            SELECT EXISTS (
                SELECT 1
                FROM public.order_items
                WHERE product_id = ${productId}
            ) AS has_orders
        `;

    const { has_orders: hasOrders } = (
      references as ProductOrderReferenceRow[]
    )[0];

    if (hasOrders) {
      return {
        success: false,
        message:
          'Este produto já possui pedidos vinculados e não pode ser excluído. Desative o produto para removê-lo da loja.',
      };
    }

    /*
     * Primeiro removemos as regras progressivas.
     */
    await sql`
            DELETE FROM public.product_pricing_rules
            WHERE product_id = ${productId}
        `;

    /*
     * Depois removemos o produto.
     */
    await sql`
            DELETE FROM public.products
            WHERE id = ${productId}
        `;

    /*
     * O produto já foi removido do banco.
     * Agora podemos excluir sua imagem.
     */
    if (product.image_url && isVercelBlobUrl(product.image_url)) {
      try {
        await del(product.image_url);
      } catch (deleteImageError) {
        console.error(
          'Produto excluído, mas não foi possível excluir sua imagem:',
          deleteImageError
        );
      }
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);

    return {
      success: false,
      message: 'Não foi possível excluir o produto. Tente novamente.',
    };
  }

  revalidatePath('/');
  revalidatePath('/admin/products');

  return {
    success: true,
    message: 'Produto excluído com sucesso.',
  };
}
