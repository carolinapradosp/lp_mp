// lib/orders/delete-pending-order.ts

import { dbPool } from '@/lib/db';

import type { PendingOrder } from './create-pending-order';

export async function deletePendingOrder({
  pendingOrder,
}: {
  pendingOrder: PendingOrder;
}): Promise<void> {
  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    /*
     * Apaga primeiro o pagamento local,
     * pois ele referencia orders.
     */
    await client.query(
      `
        DELETE FROM public.payments

        WHERE
          id = $1
          AND order_id = $2
          AND mercadopago_payment_id IS NULL
      `,
      [pendingOrder.paymentRecordId, pendingOrder.orderId]
    );

    /*
     * Remove os itens do pedido.
     */
    await client.query(
      `
        DELETE FROM public.order_items

        WHERE order_id = $1
      `,
      [pendingOrder.orderId]
    );

    /*
     * Finalmente remove o pedido.
     *
     * A condição mercadopago_external_id IS NULL
     * é uma proteção adicional para nunca apagar
     * acidentalmente um pedido que já recebeu um
     * pagamento real do Mercado Pago.
     */
    const deletedOrder = await client.query(
      `
          DELETE FROM public.orders

          WHERE
            id = $1

            AND external_reference = $2

            AND mercadopago_external_id IS NULL

          RETURNING id
        `,
      [pendingOrder.orderId, pendingOrder.externalReference]
    );

    if (deletedOrder.rowCount === 0) {
      throw new Error('O pedido pendente não pôde ser removido.');
    }

    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Erro ao desfazer exclusão do pedido pendente:',
        rollbackError
      );
    }

    throw error;
  } finally {
    client.release();
  }
}
