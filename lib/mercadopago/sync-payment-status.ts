// lib/mercadopago/sync-payment-status.ts

import { pusherServer } from '@/lib/pusher-server';

import { mercadoPagoPayment } from './client';

import {
  isMPStatus,
  isRefundLikeStatus,
  shouldUpdatePaymentStatus,
  type MPStatus,
} from './payment-status';
import { dbPool } from '../database/neon';

type PaymentRow = {
  id: string;
  order_id: string;
  status: string | null;
  mercadopago_status: string | null;
  mercadopago_payment_id: string;
};

type OrderItemRow = {
  product_id: string;
  quantity: number | string;
};

type TransactionResult =
  | {
      found: false;
    }
  | {
      found: true;
      updated: boolean;
      orderId: string;
    };

export type SyncPaymentResult =
  | {
      success: true;
      status: MPStatus;
      updated: boolean;
    }
  | {
      success: false;
      reason: string;
    };

export async function syncPaymentStatus(
  mercadopagoPaymentId: string
): Promise<SyncPaymentResult> {
  try {
    const mpPayment = await mercadoPagoPayment.get({
      id: mercadopagoPaymentId,
    });

    const rawStatus = mpPayment.status ?? 'pending';

    if (!isMPStatus(rawStatus)) {
      console.error(
        'Status desconhecido retornado pelo Mercado Pago:',
        rawStatus
      );

      return {
        success: false,
        reason: 'UNKNOWN_PAYMENT_STATUS',
      };
    }

    const statusMP = rawStatus;

    const client = await dbPool.connect();

    let transactionResult: TransactionResult;

    try {
      await client.query('BEGIN');

      await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      const paymentResult = await client.query<PaymentRow>(
        `
            SELECT
              id,
              order_id,
              status,
              mercadopago_status,
              mercadopago_payment_id
            FROM public.payments
            WHERE mercadopago_payment_id = $1
            LIMIT 1
            FOR UPDATE
          `,
        [mercadopagoPaymentId]
      );

      const paymentRecord = paymentResult.rows[0];

      if (!paymentRecord) {
        transactionResult = {
          found: false,
        };

        await client.query('COMMIT');
      } else {
        const currentStatus =
          paymentRecord.mercadopago_status ?? paymentRecord.status ?? 'pending';

        const canUpdate = shouldUpdatePaymentStatus({
          currentStatus,
          nextStatus: statusMP,
        });

        if (!canUpdate) {
          transactionResult = {
            found: true,
            updated: false,
            orderId: paymentRecord.order_id,
          };

          await client.query('COMMIT');
        } else {
          const firstApproval =
            currentStatus !== 'approved' && statusMP === 'approved';

          const becameRefunded =
            !isRefundLikeStatus(currentStatus) && isRefundLikeStatus(statusMP);

          /*
           * IMPORTANTE:
           *
           * status e mercadopago_status possuem
           * tipos diferentes no PostgreSQL.
           *
           * Por isso não podemos reutilizar
           * o mesmo placeholder para as duas
           * colunas.
           */
          await client.query(
            `
              UPDATE public.payments
              SET
                status = $1,
                mercadopago_status = $2,
                paid_at =
                  CASE
                    WHEN $3 = 'approved'
                    THEN COALESCE(
                      paid_at,
                      NOW()
                    )
                    ELSE paid_at
                  END,
                updated_at = NOW()
              WHERE id = $4
            `,
            [statusMP, statusMP, statusMP, paymentRecord.id]
          );

          await client.query(
            `
              UPDATE public.orders
              SET
                status = $1,
                updated_at = NOW()
              WHERE id = $2
            `,
            [statusMP, paymentRecord.order_id]
          );

          if (firstApproval || becameRefunded) {
            const itemsResult = await client.query<OrderItemRow>(
              `
                  SELECT
                    product_id,
                    quantity
                  FROM public.order_items
                  WHERE order_id = $1
                `,
              [paymentRecord.order_id]
            );

            for (const item of itemsResult.rows) {
              const quantity = Number(item.quantity);

              if (!Number.isSafeInteger(quantity) || quantity <= 0) {
                throw new Error(
                  `Quantidade inválida no item do pedido ${paymentRecord.order_id}.`
                );
              }

              if (firstApproval) {
                const updatedProduct = await client.query(
                  `
                      UPDATE public.products
                      SET
                        stock = stock - $1,
                        updated_at = NOW()
                      WHERE
                        id = $2
                        AND stock >= $1
                      RETURNING id
                    `,
                  [quantity, item.product_id]
                );

                if (updatedProduct.rowCount === 0) {
                  throw new Error(
                    `Estoque insuficiente para o produto ${item.product_id}.`
                  );
                }
              }

              if (becameRefunded) {
                await client.query(
                  `
                    UPDATE public.products
                    SET
                      stock = stock + $1,
                      updated_at = NOW()
                    WHERE id = $2
                  `,
                  [quantity, item.product_id]
                );
              }
            }
          }

          transactionResult = {
            found: true,
            updated: true,
            orderId: paymentRecord.order_id,
          };

          await client.query('COMMIT');
        }
      }
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error(
          'Erro ao realizar rollback da sincronização:',
          rollbackError
        );
      }

      throw error;
    } finally {
      client.release();
    }

    if (!transactionResult.found) {
      console.error(
        'Pagamento não encontrado localmente:',
        mercadopagoPaymentId
      );

      return {
        success: false,
        reason: 'LOCAL_PAYMENT_NOT_FOUND',
      };
    }

    /*
     * Envia o evento mesmo quando o banco
     * já possuía esse status.
     *
     * Isso permite que uma tela aberta
     * receba novamente o estado atual.
     */
    try {
      await pusherServer.trigger(
        `payment-${mercadopagoPaymentId}`,
        'payment-status-updated',
        {
          status: statusMP,
          paymentId: mercadopagoPaymentId,
        }
      );
    } catch (error) {
      /*
       * Falha no Pusher não desfaz a
       * atualização do banco.
       *
       * O polling da tela continuará
       * funcionando como fallback.
       */
      console.error('Erro ao enviar evento Pusher:', error);
    }

    return {
      success: true,
      status: statusMP,
      updated: transactionResult.updated,
    };
  } catch (error) {
    console.error('Erro ao sincronizar pagamento:', error);

    return {
      success: false,
      reason: error instanceof Error ? error.message : 'UNKNOWN_SYNC_ERROR',
    };
  }
}
