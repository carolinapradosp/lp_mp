import getUnitPrice from '@/utils/cart';

import type { PricingRule } from '@/interfaces/Product';

describe('getUnitPrice', () => {
  const pricingRules: PricingRule[] = [
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
  ];

  it('deve retornar o preço base quando não existem regras de preço', () => {
    const price = getUnitPrice(1199, 1, []);

    expect(price).toBe(1199);
  });

  it('deve retornar o preço base quando a quantidade não atinge nenhuma regra', () => {
    const price = getUnitPrice(1199, 1, pricingRules);

    expect(price).toBe(1199);
  });

  it('deve aplicar a regra de 2 unidades', () => {
    const price = getUnitPrice(1199, 2, pricingRules);

    expect(price).toBe(1119);
  });

  it('deve aplicar a regra de 3 unidades', () => {
    const price = getUnitPrice(1199, 3, pricingRules);

    expect(price).toBe(1099);
  });

  it('deve aplicar a regra de 4 unidades', () => {
    const price = getUnitPrice(1199, 4, pricingRules);

    expect(price).toBe(1059);
  });

  it('deve manter a maior regra aplicável quando a quantidade ultrapassa a última faixa', () => {
    const price = getUnitPrice(1199, 8, pricingRules);

    expect(price).toBe(1059);
  });

  it('deve funcionar mesmo que as regras estejam fora de ordem', () => {
    const unorderedRules: PricingRule[] = [
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
    ];

    const price = getUnitPrice(1199, 3, unorderedRules);

    expect(price).toBe(1099);
  });
});
