// app/api/payment-status/route.ts

import { NextResponse } from 'next/server';

import { sql } from '@/lib/database/neon';
import { syncPaymentStatus } from '@/lib/mercadopago/sync-payment-status';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const paymentId = searchParams.get('paymentId');

    console.log('🟡 paymentId:', paymentId);

    if (!paymentId) {
      return NextResponse.json(
        {
          status: 'pending',
          error: 'paymentId obrigatório',
        },
        {
          status: 400,
        }
      );
    }

    const syncResult = await syncPaymentStatus(paymentId);

    if (!syncResult.success) {
      console.error('❌ Falha ao sincronizar pagamento:', syncResult.reason);
    }

    const paymentResult = await sql`
      SELECT
        status
      FROM public.payments
      WHERE mercadopago_payment_id = ${paymentId}
      LIMIT 1
    `;

    const payment = paymentResult[0];

    if (!payment) {
      console.error('❌ Pagamento não encontrado');

      return NextResponse.json(
        {
          status: 'pending',
          error: 'PAYMENT_NOT_FOUND',
        },
        {
          status: 404,
        }
      );
    }

    console.log('✅ Status final:', payment.status);

    return NextResponse.json({
      status: payment.status,
    });
  } catch (error) {
    console.error('❌ Erro payment-status:', error);

    return NextResponse.json(
      {
        status: 'pending',
      },
      {
        status: 500,
      }
    );
  }
}
