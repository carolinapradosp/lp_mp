import type { PricingRule } from '@/interfaces/Product';

import {
  parseCurrency,
  parsePricingRules,
  validateProductData,
  type ParsedProductFormData,
} from '@/lib/products/validation';

function createValidProduct(
  overrides: Partial<ParsedProductFormData> = {}
): ParsedProductFormData {
  return {
    productId: '',
    title: 'Produto teste',
    description: 'Descrição',
    basePrice: 1199,
    imageUrl: 'https://example.com/produto.jpg',
    stock: 10,
    active: true,
    pricingRules: [
      {
        min_quantity: 2,
        unit_price: 1119,
      },
      {
        min_quantity: 3,
        unit_price: 1099,
      },
      {
        min_quantity: 4,
        unit_price: 1059,
      },
    ],
    ...overrides,
  };
}

describe('parseCurrency', () => {
  it('converte valor brasileiro com milhar e vírgula', () => {
    expect(parseCurrency('1.149,90')).toBe(1149.9);
  });

  it('converte valor com vírgula', () => {
    expect(parseCurrency('1149,90')).toBe(1149.9);
  });

  it('converte valor com ponto decimal', () => {
    expect(parseCurrency('1149.90')).toBe(1149.9);
  });

  it('retorna NaN para valor vazio', () => {
    expect(Number.isNaN(parseCurrency(''))).toBe(true);
  });
});

describe('parsePricingRules', () => {
  it('converte JSON em regras de preço', () => {
    const rules = parsePricingRules(
      JSON.stringify([
        {
          min_quantity: 2,
          unit_price: 1119,
        },
        {
          min_quantity: 3,
          unit_price: 1099,
        },
      ])
    );

    expect(rules).toEqual([
      {
        min_quantity: 2,
        unit_price: 1119,
      },
      {
        min_quantity: 3,
        unit_price: 1099,
      },
    ]);
  });

  it('ordena as regras por quantidade mínima', () => {
    const rules = parsePricingRules(
      JSON.stringify([
        {
          min_quantity: 4,
          unit_price: 1059,
        },
        {
          min_quantity: 2,
          unit_price: 1119,
        },
        {
          min_quantity: 3,
          unit_price: 1099,
        },
      ])
    );

    expect(rules.map((rule) => rule.min_quantity)).toEqual([2, 3, 4]);
  });

  it('ignora regras inválidas', () => {
    const rules = parsePricingRules(
      JSON.stringify([
        {
          min_quantity: 1,
          unit_price: 1000,
        },
        {
          min_quantity: 2,
          unit_price: -50,
        },
        {
          min_quantity: 3,
          unit_price: 900,
        },
      ])
    );

    expect(rules).toEqual([
      {
        min_quantity: 3,
        unit_price: 900,
      },
    ]);
  });

  it('retorna array vazio quando o JSON é inválido', () => {
    expect(parsePricingRules('isso não é json')).toEqual([]);
  });
});

describe('validateProductData', () => {
  it('não retorna erros para um produto válido', () => {
    const errors = validateProductData(createValidProduct());

    expect(errors).toEqual({});
  });

  it('rejeita produto sem nome', () => {
    const errors = validateProductData(
      createValidProduct({
        title: '',
      })
    );

    expect(errors.title).toBe('Informe o nome do produto.');
  });

  it('rejeita preço base igual a zero', () => {
    const errors = validateProductData(
      createValidProduct({
        basePrice: 0,
      })
    );

    expect(errors.base_price).toBe('Informe um preço válido.');
  });

  it('rejeita preço base negativo', () => {
    const errors = validateProductData(
      createValidProduct({
        basePrice: -100,
      })
    );

    expect(errors.base_price).toBe('Informe um preço válido.');
  });

  it('rejeita estoque negativo', () => {
    const errors = validateProductData(
      createValidProduct({
        stock: -1,
      })
    );

    expect(errors.stock).toBe('Informe uma quantidade de estoque válida.');
  });

  it('rejeita estoque decimal', () => {
    const errors = validateProductData(
      createValidProduct({
        stock: 2.5,
      })
    );

    expect(errors.stock).toBe('Informe uma quantidade de estoque válida.');
  });

  it('aceita estoque zero', () => {
    const errors = validateProductData(
      createValidProduct({
        stock: 0,
      })
    );

    expect(errors.stock).toBeUndefined();
  });

  it('rejeita URL de imagem inválida', () => {
    const errors = validateProductData(
      createValidProduct({
        imageUrl: 'imagem-invalida',
      })
    );

    expect(errors.image_url).toBe('Informe uma URL de imagem válida.');
  });

  it('aceita produto sem imagem', () => {
    const errors = validateProductData(
      createValidProduct({
        imageUrl: '',
      })
    );

    expect(errors.image_url).toBeUndefined();
  });

  it('rejeita quantidades mínimas duplicadas', () => {
    const pricingRules: PricingRule[] = [
      {
        min_quantity: 2,
        unit_price: 1100,
      },
      {
        min_quantity: 2,
        unit_price: 1000,
      },
    ];

    const errors = validateProductData(
      createValidProduct({
        pricingRules,
      })
    );

    expect(errors.pricing_rules).toBe('Não repita a mesma quantidade mínima.');
  });

  it('rejeita preço progressivo igual ao preço base', () => {
    const errors = validateProductData(
      createValidProduct({
        pricingRules: [
          {
            min_quantity: 2,
            unit_price: 1199,
          },
        ],
      })
    );

    expect(errors.pricing_rules).toBe(
      'O preço progressivo deve ser menor que o preço base.'
    );
  });

  it('rejeita preço progressivo maior que o preço base', () => {
    const errors = validateProductData(
      createValidProduct({
        pricingRules: [
          {
            min_quantity: 2,
            unit_price: 1300,
          },
        ],
      })
    );

    expect(errors.pricing_rules).toBe(
      'O preço progressivo deve ser menor que o preço base.'
    );
  });

  it('rejeita preço que aumenta conforme a quantidade aumenta', () => {
    const errors = validateProductData(
      createValidProduct({
        pricingRules: [
          {
            min_quantity: 2,
            unit_price: 1000,
          },
          {
            min_quantity: 3,
            unit_price: 1050,
          },
        ],
      })
    );

    expect(errors.pricing_rules).toBe(
      'O preço unitário deve diminuir conforme a quantidade aumenta.'
    );
  });

  it('aceita preços progressivamente menores', () => {
    const errors = validateProductData(
      createValidProduct({
        pricingRules: [
          {
            min_quantity: 2,
            unit_price: 1100,
          },
          {
            min_quantity: 3,
            unit_price: 1050,
          },
          {
            min_quantity: 4,
            unit_price: 1000,
          },
        ],
      })
    );

    expect(errors.pricing_rules).toBeUndefined();
  });

  it('aceita produto sem regras progressivas', () => {
    const errors = validateProductData(
      createValidProduct({
        pricingRules: [],
      })
    );

    expect(errors.pricing_rules).toBeUndefined();
  });
});
