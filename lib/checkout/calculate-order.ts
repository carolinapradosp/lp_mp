// lib/checkout/calculate-order.ts

import { getShippingCost } from '@/lib/settings/queries';
import { CheckoutError } from './checkout-error';
import type {
  CalculatedOrder,
  CalculatedOrderItem,
  CheckoutItemInput,
} from './types';
import { sql } from '../database/neon';

type ProductRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  base_price: string | number;
  stock: string | number;
  active?: boolean | null;
};

type PricingRuleRow = {
  product_id: string;
  min_quantity: string | number;
  unit_price: string | number;
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateUnitPrice({
  basePrice,
  quantity,
  pricingRules,
}: {
  basePrice: number;
  quantity: number;
  pricingRules: PricingRuleRow[];
}): number {
  const applicableRule = pricingRules
    .filter((rule) => Number(rule.min_quantity) <= quantity)
    .sort((a, b) => Number(b.min_quantity) - Number(a.min_quantity))[0];

  const unitPrice = applicableRule
    ? Number(applicableRule.unit_price)
    : basePrice;

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new CheckoutError({
      code: 'INVALID_PRODUCT_PRICE',
      message: 'Um dos produtos possui uma configuração de preço inválida.',
      statusCode: 500,
    });
  }

  return roundMoney(unitPrice);
}

export async function calculateOrder(
  inputItems: CheckoutItemInput[]
): Promise<CalculatedOrder> {
  const productIds = inputItems.map((item) => item.productId);

  const productRows = (await sql`
    SELECT
      id,
      title,
      description,
      image_url,
      base_price,
      stock,
      active
    FROM public.products
    WHERE id = ANY(${productIds})
  `) as ProductRow[];

  if (productRows.length !== productIds.length) {
    const foundIds = new Set(productRows.map((product) => String(product.id)));

    const missingIds = productIds.filter((id) => !foundIds.has(String(id)));

    throw new CheckoutError({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Um ou mais produtos do carrinho não estão disponíveis.',
      statusCode: 409,
      details: {
        productIds: missingIds,
      },
    });
  }

  const unavailableProduct = productRows.find(
    (product) => product.active === false
  );

  if (unavailableProduct) {
    throw new CheckoutError({
      code: 'PRODUCT_UNAVAILABLE',
      message: `O produto "${unavailableProduct.title}" não está disponível.`,
      statusCode: 409,
      details: {
        productId: unavailableProduct.id,
      },
    });
  }

  const pricingRules = (await sql`
    SELECT
      product_id,
      min_quantity,
      unit_price
    FROM public.product_pricing_rules
    WHERE product_id = ANY(${productIds})
    ORDER BY product_id, min_quantity DESC
  `) as PricingRuleRow[];

  const calculatedItems: CalculatedOrderItem[] = inputItems.map((inputItem) => {
    const product = productRows.find(
      (row) => String(row.id) === String(inputItem.productId)
    );

    if (!product) {
      throw new CheckoutError({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Um produto do carrinho não foi encontrado.',
        statusCode: 409,
      });
    }

    const stock = Number(product.stock);
    const basePrice = Number(product.base_price);

    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw new CheckoutError({
        code: 'INVALID_PRODUCT_STOCK',
        message: `O estoque do produto "${product.title}" está inválido.`,
        statusCode: 500,
        details: {
          productId: product.id,
        },
      });
    }

    if (inputItem.quantity > stock) {
      throw new CheckoutError({
        code: 'INSUFFICIENT_STOCK',
        message: `O produto "${product.title}" possui apenas ${stock} unidade(s) disponível(is).`,
        statusCode: 409,
        details: {
          productId: product.id,
          requestedQuantity: inputItem.quantity,
          availableQuantity: stock,
        },
      });
    }

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      throw new CheckoutError({
        code: 'INVALID_PRODUCT_PRICE',
        message: `O preço do produto "${product.title}" está inválido.`,
        statusCode: 500,
        details: {
          productId: product.id,
        },
      });
    }

    const productRules = pricingRules.filter(
      (rule) => String(rule.product_id) === String(product.id)
    );

    const unitPrice = calculateUnitPrice({
      basePrice,
      quantity: inputItem.quantity,
      pricingRules: productRules,
    });

    return {
      productId: String(product.id),
      title: product.title,
      description: product.description,
      imageUrl: product.image_url,
      quantity: inputItem.quantity,
      stock,
      unitPrice,
      totalPrice: roundMoney(unitPrice * inputItem.quantity),
    };
  });

  const subtotal = roundMoney(
    calculatedItems.reduce((total, item) => total + item.totalPrice, 0)
  );

  const shippingCost = roundMoney(await getShippingCost());

  const discount = 0;

  const totalAmount = roundMoney(subtotal + shippingCost - discount);

  if (totalAmount <= 0) {
    throw new CheckoutError({
      code: 'INVALID_ORDER_TOTAL',
      message: 'O valor total do pedido é inválido.',
      statusCode: 400,
    });
  }

  return {
    items: calculatedItems,
    subtotal,
    shippingCost,
    discount,
    totalAmount,
  };
}
