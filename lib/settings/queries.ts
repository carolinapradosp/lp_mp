// lib/settings/queries.ts

import { CheckoutError } from '@/lib/checkout/checkout-error';
import { sql } from '../database/neon';

type SettingRow = {
  key: string;
  value: string | number | null;
};

export async function getSetting(key: string): Promise<string | null> {
  const rows = (await sql`
    SELECT key, value
    FROM public.system_settings
    WHERE key = ${key}
    LIMIT 1
  `) as SettingRow[];

  const setting = rows[0];

  if (!setting || setting.value === null) {
    return null;
  }

  return String(setting.value);
}

export async function getShippingCost(): Promise<number> {
  const rawValue = await getSetting('shipping_cost');

  if (rawValue === null) {
    return 0;
  }

  const shippingCost = Number(rawValue);

  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    throw new CheckoutError({
      code: 'INVALID_SHIPPING_CONFIGURATION',
      message: 'A configuração do frete está inválida.',
      statusCode: 500,
    });
  }

  return shippingCost;
}

export async function getPublicSettings() {
  return sql`
    SELECT key, value
    FROM public.system_settings
    ORDER BY key
  `;
}
