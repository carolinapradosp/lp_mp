// app/api/payment-status/route.ts

import { NextResponse } from 'next/server';

import { neon } from '@neondatabase/serverless';

import { syncPaymentStatus } from '@/lib/mercadopago/sync-payment-status';

const sql = neon(process.env.DATABASE_URL_PRD!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const paymentId = searchParams.get('paymentId');

    console.log('================ PAYMENT STATUS ================');

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

    // SINCRONIZA COM MP
    await syncPaymentStatus(paymentId);

    // BUSCA STATUS ATUALIZADO
    const paymentResult = await sql`
      SELECT *
      FROM public.payments
      WHERE mercadopago_payment_id = ${paymentId}
      LIMIT 1
    `;

    const payment = paymentResult[0];

    if (!payment) {
      console.error('❌ Payment não encontrado');

      return NextResponse.json(
        {
          status: 'pending',
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
  } catch (err) {
    console.error('❌ Erro payment-status:', err);

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
