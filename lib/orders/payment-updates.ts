// lib/orders/payment-updates.ts

import { dbPool } from '@/lib/db';

import type { PendingOrder } from './create-pending-order';
import type { MPStatus } from '@/lib/mercadopago/payment-status';

export type MercadoPagoPaymentResult = {
  id: string;
  status: MPStatus;
  paymentMethodId: string;
  transactionAmount: number;
};

export async function savePaymentResult({
  pendingOrder,
  payment,
}: {
  pendingOrder: PendingOrder;
  payment: MercadoPagoPaymentResult;
}): Promise<void> {
  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const updatedPayments = await client.query(
      `
    UPDATE public.payments
    SET
      amount = $1,
      status = $2,
      payment_method = $3,
      mercadopago_payment_id = $4,
      mercadopago_status = $5,
      updated_at = NOW()
    WHERE
      id = $6
      AND order_id = $7
    RETURNING id
  `,
      [
        payment.transactionAmount,
        payment.status,
        payment.paymentMethodId,
        payment.id,
        payment.status,
        pendingOrder.paymentRecordId,
        pendingOrder.orderId,
      ]
    );

    if (updatedPayments.rowCount === 0) {
      throw new Error('Registro local do pagamento não encontrado.');
    }

    const updatedOrders = await client.query(
      `
        UPDATE public.orders
        SET
          status = $1,
          payment_method = $2,
          mercadopago_external_id = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING id
      `,
      [
        payment.status,
        payment.paymentMethodId,
        payment.id,
        pendingOrder.orderId,
      ]
    );

    if (updatedOrders.rowCount === 0) {
      throw new Error('Pedido local não encontrado.');
    }

    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Erro ao desfazer atualização do pagamento:',
        rollbackError
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function markPaymentCreationFailed({
  pendingOrder,
}: {
  pendingOrder: PendingOrder;
}): Promise<void> {
  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const updatedPayments = await client.query(
      `
    UPDATE public.payments
    SET
      status = $1,
      mercadopago_status = $2,
      updated_at = NOW()
    WHERE
      id = $3
      AND order_id = $4
    RETURNING id
  `,
      [
        'rejected',
        'rejected',
        pendingOrder.paymentRecordId,
        pendingOrder.orderId,
      ]
    );
    if (updatedPayments.rowCount === 0) {
      throw new Error('Registro local do pagamento não encontrado.');
    }

    const updatedOrders = await client.query(
      `
        UPDATE public.orders
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING id
      `,
      ['rejected', pendingOrder.orderId]
    );

    if (updatedOrders.rowCount === 0) {
      throw new Error('Pedido local não encontrado.');
    }

    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Erro ao desfazer marcação de falha do pagamento:',
        rollbackError
      );
    }

    throw error;
  } finally {
    client.release();
  }
}
