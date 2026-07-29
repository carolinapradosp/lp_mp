// lib/orders/queries.ts

import 'server-only';

import type { Order } from '@/interfaces/Order';
import { sql } from '@/lib/database/neon';
import type { GetOrdersParams, OrdersQueryResult } from './types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function getOrdersFromDatabase({
  orderId = '',
  cpf = '',
  email = '',
  status = '',
  limit = DEFAULT_LIMIT,
  offset = 0,
}: GetOrdersParams = {}): Promise<OrdersQueryResult> {
  const normalizedOrderId = orderId.trim();
  const normalizedCpf = cpf.trim();
  const normalizedEmail = email.trim();
  const normalizedStatus = status.trim();

  const safeLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const safeOffset = Math.max(Number(offset) || 0, 0);

  const [ordersResult, countResult] = await Promise.all([
    sql`
      SELECT
        o.id,
        o.customer_name,
        o.customer_email,
        o.customer_cpf,
        o.total_amount,
        o.payment_method,
        o.status,
        o.created_at,
        o.mercadopago_external_id
      FROM public.orders o
      WHERE
        (
          ${normalizedOrderId} = ''
          OR o.id::text ILIKE ${`%${normalizedOrderId}%`}
          OR o.mercadopago_external_id::text
             ILIKE ${`%${normalizedOrderId}%`}
        )
        AND (
          ${normalizedCpf} = ''
          OR o.customer_cpf ILIKE ${`%${normalizedCpf}%`}
        )
        AND (
          ${normalizedEmail} = ''
          OR o.customer_email ILIKE ${`%${normalizedEmail}%`}
        )
        AND (
          ${normalizedStatus} = ''
          OR o.status = ${normalizedStatus}
        )
      ORDER BY o.created_at DESC
      LIMIT ${safeLimit}
      OFFSET ${safeOffset}
    `,

    sql`
      SELECT COUNT(*)::int AS total
      FROM public.orders o
      WHERE
        (
          ${normalizedOrderId} = ''
          OR o.id::text ILIKE ${`%${normalizedOrderId}%`}
          OR o.mercadopago_external_id::text
             ILIKE ${`%${normalizedOrderId}%`}
        )
        AND (
          ${normalizedCpf} = ''
          OR o.customer_cpf ILIKE ${`%${normalizedCpf}%`}
        )
        AND (
          ${normalizedEmail} = ''
          OR o.customer_email ILIKE ${`%${normalizedEmail}%`}
        )
        AND (
          ${normalizedStatus} = ''
          OR o.status = ${normalizedStatus}
        )
    `,
  ]);

  return {
    orders: ordersResult as Order[],
    totalOrders: Number(countResult[0]?.total ?? 0),
  };
}
