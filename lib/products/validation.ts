// lib/products/validation.ts

import type { PricingRule } from '@/interfaces/Product';

export type ProductFormErrors = {
  title?: string;
  description?: string;
  base_price?: string;
  image_url?: string;
  stock?: string;
  pricing_rules?: string;
};

export type ParsedProductFormData = {
  productId: string;
  title: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  active: boolean;
  pricingRules: PricingRule[];
};

export function parseCurrency(value: FormDataEntryValue | null): number {
  const originalValue = String(value ?? '')
    .trim()
    .replace(/\s/g, '');

  if (!originalValue) {
    return Number.NaN;
  }

  // 1.149,90 -> 1149.90
  if (originalValue.includes('.') && originalValue.includes(',')) {
    return Number(originalValue.replace(/\./g, '').replace(',', '.'));
  }

  // 1149,90 -> 1149.90
  if (originalValue.includes(',')) {
    return Number(originalValue.replace(',', '.'));
  }

  // 1149.90 -> 1149.90
  return Number(originalValue);
}

export function parsePricingRules(
  value: FormDataEntryValue | null
): PricingRule[] {
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

export function getProductFormData(formData: FormData): ParsedProductFormData {
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

export function validateProductData({
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

    return errors;
  }

  const hasPriceGreaterThanBase = pricingRules.some(
    (rule) => rule.unit_price >= basePrice
  );

  if (hasPriceGreaterThanBase) {
    errors.pricing_rules =
      'O preço progressivo deve ser menor que o preço base.';

    return errors;
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
