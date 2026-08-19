// app/api/jobs/reconcile-payments/route.ts
import { NextResponse } from 'next/server';
import { syncPaymentStatus } from '@/lib/mercadopago/sync-payment-status';
import { sql } from '@/lib/database/neon';

export async function GET(request: Request) {
  try {
    console.log('================ RECONCILE PAYMENTS ================');

    // SEGURANÇA
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized');

      return new NextResponse('Unauthorized', {
        status: 401,
      });
    }

    // BUSCA PAYMENTS RECENTES
    const payments = await sql`
      SELECT
  mercadopago_payment_id,
  status,
  created_at
FROM public.payments
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND mercadopago_payment_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 200
    `;

    console.log(`📦 ${payments.length} pagamentos encontrados`);
    const results = [];

    for (const payment of payments) {
      try {
        console.log('🟡 Sincronizando:', payment.mercadopago_payment_id);
        const result = await syncPaymentStatus(payment.mercadopago_payment_id);
        results.push({
          paymentId: payment.mercadopago_payment_id,
          success: result.success,
          status: result.success ? result.status : null,
          reason: result.success ? null : result.reason,
        });
      } catch (err) {
        console.error(
          '❌ Erro sync payment:',
          payment.mercadopago_payment_id,
          err
        );

        results.push({
          paymentId: payment.mercadopago_payment_id,
          success: false,
        });
      }
    }

    console.log('================ FIM RECONCILE ================');

    return NextResponse.json({
      success: true,
      total: payments.length,
      results,
    });
  } catch (err) {
    console.error('❌ Erro reconcile-payments:', err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
