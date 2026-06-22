// lib/mercadopago/sync-payment-status.ts

import { neon } from '@neondatabase/serverless';

import { MercadoPagoConfig, Payment } from 'mercadopago';

import { pusherServer } from '@/lib/pusher-server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const sql = neon(process.env.DATABASE_URL_PRD!);

type MPStatus =
  | 'pending'
  | 'approved'
  | 'authorized'
  | 'in_process'
  | 'in_mediation'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back';

const STATUS_PRIORITY: Record<MPStatus, number> = {
  pending: 1,
  in_process: 2,
  authorized: 3,
  approved: 4,
  refunded: 5,
  charged_back: 6,
  cancelled: 7,
  rejected: 8,
  in_mediation: 9,
};

function shouldUpdateStatus(currentStatus: string, newStatus: string) {
  const current = STATUS_PRIORITY[currentStatus as MPStatus] || 0;

  const next = STATUS_PRIORITY[newStatus as MPStatus] || 0;

  return next >= current;
}

export async function syncPaymentStatus(mercadopagoPaymentId: string) {
  try {
    console.log('================ SYNC PAYMENT ================');

    console.log('🟡 paymentId:', mercadopagoPaymentId);

    // CONSULTA MP
    const paymentApi = new Payment(client);

    const mpPayment = await paymentApi.get({
      id: mercadopagoPaymentId,
    });

    console.log('📦 MP PAYMENT:', JSON.stringify(mpPayment, null, 2));

    const statusMP = (mpPayment.status as MPStatus) || 'pending';

    console.log('✅ statusMP:', statusMP);

    // BUSCA PAYMENT LOCAL
    const paymentResult = await sql`
      SELECT *
      FROM public.payments
      WHERE mercadopago_payment_id = ${mercadopagoPaymentId}
      LIMIT 1
    `;

    const paymentRecord = paymentResult[0];

    if (!paymentRecord) {
      console.error('❌ Payment não encontrado localmente');

      return;
    }

    const currentStatus = paymentRecord.mercadopago_status;

    console.log('📦 currentStatus:', currentStatus);

    // EVITA REGRESSÃO DE STATUS
    const canUpdate = shouldUpdateStatus(currentStatus, statusMP);

    console.log('✅ canUpdate:', canUpdate);

    if (!canUpdate) {
      console.log('⚠️ Ignorando regressão de status');

      return;
    }

    // DETECTA PRIMEIRA APROVAÇÃO
    const firstApproval =
      currentStatus !== 'approved' && statusMP === 'approved';

    // DETECTA REFUND
    const refundedStatuses = ['refunded', 'charged_back', 'cancelled'];

    const becameRefunded =
      !refundedStatuses.includes(currentStatus) &&
      refundedStatuses.includes(statusMP);

    console.log('✅ firstApproval:', firstApproval);

    console.log('✅ becameRefunded:', becameRefunded);

    // UPDATE PAYMENT
    const updatedPayment = await sql`
      UPDATE public.payments
      SET
        status = ${statusMP},

        mercadopago_status = ${statusMP},

        paid_at =
          CASE
            WHEN ${statusMP} = 'approved'
            THEN COALESCE(paid_at, NOW())
            ELSE paid_at
          END,

        updated_at = NOW()

      WHERE mercadopago_payment_id = ${mercadopagoPaymentId}

      RETURNING *
    `;

    console.log('✅ payment atualizado:', updatedPayment);

    // UPDATE ORDER
    const updatedOrder = await sql`
      UPDATE public.orders
      SET
        status = ${statusMP},
        updated_at = NOW()

      WHERE id = ${paymentRecord.order_id}

      RETURNING *
    `;

    console.log('✅ order atualizado:', updatedOrder);

    // BAIXA ESTOQUE
    if (firstApproval) {
      console.log('📦 Baixando estoque...');

      const items = await sql`
        SELECT *
        FROM public.order_items
        WHERE order_id = ${paymentRecord.order_id}
      `;

      for (const item of items) {
        await sql`
          UPDATE public.products
          SET stock = GREATEST(
            stock - ${item.quantity},
            0
          )
          WHERE id = ${item.product_id}
        `;
      }

      console.log('✅ Estoque baixado');
    }

    // DEVOLVE ESTOQUE EM REFUND
    if (becameRefunded) {
      console.log('📦 Devolvendo estoque...');

      const items = await sql`
        SELECT *
        FROM public.order_items
        WHERE order_id = ${paymentRecord.order_id}
      `;

      for (const item of items) {
        await sql`
          UPDATE public.products
          SET stock = stock + ${item.quantity}
          WHERE id = ${item.product_id}
        `;
      }

      console.log('✅ Estoque devolvido');
    }

    // PUSHER
    try {
      await pusherServer.trigger(
        `payment-${mercadopagoPaymentId}`,
        'payment-status-updated',
        {
          status: statusMP,
          paymentId: mercadopagoPaymentId,
        }
      );

      console.log('✅ Evento Pusher enviado');
    } catch (err) {
      console.error('❌ Erro Pusher:', err);
    }

    console.log('================ FIM SYNC PAYMENT ================');

    return {
      success: true,
      status: statusMP,
    };
  } catch (err) {
    console.error('❌ Erro syncPaymentStatus:', err);

    return {
      success: false,
    };
  }
}
