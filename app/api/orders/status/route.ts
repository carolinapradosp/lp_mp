// app/api/orders/status/route.ts

import { NextResponse } from 'next/server';

import StatusPayment from '@/enum/StatusPayment';
import { sql } from '@/lib/db';

import type {
  OrderConfirmationData,
  OrderConfirmationError,
} from '@/lib/orders/order-confirmation';

export const dynamic = 'force-dynamic';

type OrderConfirmationRow = {
  order_id: string;
  external_reference: string;
  total_amount: string | number;
  order_status: string | null;
  order_payment_method: string | null;
  order_created_at: string | Date;

  payment_status: string | null;
  mercadopago_status: string | null;
  mercadopago_payment_id: string | null;
  payment_method: string | null;

  pix_qr_code: string | null;
  pix_expiration_at: string | Date | null;
  paid_at: string | Date | null;
};

const paymentStatuses = new Set<string>(Object.values(StatusPayment));

function normalizePaymentStatus(
  ...candidates: Array<string | null | undefined>
): StatusPayment {
  for (const candidate of candidates) {
    if (candidate && paymentStatuses.has(candidate)) {
      return candidate as StatusPayment;
    }
  }

  return StatusPayment.pending;
}

function serializeDate(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const confirmationToken = searchParams.get('token')?.trim();

    if (!confirmationToken) {
      return NextResponse.json<OrderConfirmationError>(
        {
          error: 'O token de confirmação do pedido é obrigatório.',
          code: 'CONFIRMATION_TOKEN_REQUIRED',
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    if (!isUuid(confirmationToken)) {
      return NextResponse.json<OrderConfirmationError>(
        {
          error: 'O token de confirmação informado é inválido.',
          code: 'ORDER_NOT_FOUND',
        },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const result = await sql`
      SELECT
        o.id AS order_id,
        o.external_reference,
        o.total_amount,
        o.status AS order_status,
        o.payment_method AS order_payment_method,
        o.created_at AS order_created_at,

        p.status AS payment_status,
        p.mercadopago_status,
        p.mercadopago_payment_id,
        p.payment_method,
        p.pix_qr_code,
        p.pix_expiration_at,
        p.paid_at

      FROM public.orders AS o

      LEFT JOIN public.payments AS p
        ON p.order_id = o.id

      WHERE o.confirmation_token = ${confirmationToken}::uuid

      ORDER BY p.created_at DESC NULLS LAST

      LIMIT 1
    `;

    const row = result[0] as OrderConfirmationRow | undefined;

    if (!row) {
      return NextResponse.json<OrderConfirmationError>(
        {
          error: 'O pedido solicitado não foi encontrado.',
          code: 'ORDER_NOT_FOUND',
        },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const status = normalizePaymentStatus(
      row.payment_status,
      row.mercadopago_status,
      row.order_status
    );

    const response: OrderConfirmationData = {
      orderId: row.order_id,
      externalReference: row.external_reference,

      amount: Number(row.total_amount),
      status,

      paymentId: row.mercadopago_payment_id ?? null,

      paymentMethod: row.payment_method ?? row.order_payment_method ?? null,

      pixData: row.pix_qr_code
        ? {
            qrCode: row.pix_qr_code,
            expirationAt: serializeDate(row.pix_expiration_at),
          }
        : null,

      createdAt:
        serializeDate(row.order_created_at) ?? new Date().toISOString(),

      paidAt: serializeDate(row.paid_at),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Erro ao consultar confirmação do pedido:', error);

    return NextResponse.json<OrderConfirmationError>(
      {
        error: 'Não foi possível consultar os dados do pedido.',
        code: 'ORDER_STATUS_QUERY_FAILED',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
