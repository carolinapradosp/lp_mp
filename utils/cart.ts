//utils/cart.ts
import { PricingRule } from '@/interfaces/Product';

export default function getUnitPrice(
  basePrice: number,
  quantity: number,
  pricingRules?: PricingRule[]
) {
  if (!pricingRules?.length) {
    return basePrice;
  }

  const applicableRule = [...pricingRules]
    .sort((a, b) => b.min_quantity - a.min_quantity)
    .find((rule) => quantity >= rule.min_quantity);

  return applicableRule ? Number(applicableRule.unit_price) : basePrice;
}
