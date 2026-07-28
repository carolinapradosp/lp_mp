// lib/orders/create-pending-order.ts

import crypto from 'crypto';

import { dbPool } from '@/lib/db';
import type { CalculatedOrder, CheckoutInput } from '@/lib/checkout/types';

type CreatedOrderRow = {
  id: string | number;
};

type CreatedPaymentRow = {
  id: string | number;
};

export type PendingOrder = {
  orderId: string;
  paymentRecordId: string;
  externalReference: string;
  idempotencyKey: string;
};

export async function createPendingOrder({
  checkout,
  calculatedOrder,
}: {
  checkout: CheckoutInput;
  calculatedOrder: CalculatedOrder;
}): Promise<PendingOrder> {
  const externalReference = crypto.randomUUID();
  const idempotencyKey = crypto.randomUUID();

  const customerName = [checkout.customer.firstName, checkout.customer.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const createdOrderResult = await client.query<CreatedOrderRow>(
      `
          INSERT INTO public.orders (
            customer_name,
            customer_email,
            customer_phone,
            customer_cpf,

            shipping_zip_code,
            shipping_street,
            shipping_number,
            shipping_complement,
            shipping_neighborhood,
            shipping_city,
            shipping_state,

            subtotal,
            shipping_cost,
            discount,
            total_amount,

            payment_method,
            status,

            external_reference,
            payment_idempotency_key,

            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,

            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,

            $12,
            $13,
            $14,
            $15,

            $16,
            $17,

            $18,
            $19,

            NOW(),
            NOW()
          )
          RETURNING id
        `,
      [
        customerName,
        checkout.customer.email,
        checkout.customer.phone,
        checkout.customer.identification.number,

        checkout.customer.address.zipCode,
        checkout.customer.address.streetName,
        checkout.customer.address.streetNumber,
        checkout.customer.address.complement ?? '',
        checkout.customer.address.neighborhood,
        checkout.customer.address.city,
        checkout.customer.address.federalUnit,

        calculatedOrder.subtotal,
        calculatedOrder.shippingCost,
        calculatedOrder.discount,
        calculatedOrder.totalAmount,

        checkout.payment.paymentMethodId,
        'pending',

        externalReference,
        idempotencyKey,
      ]
    );

    const order = createdOrderResult.rows[0];

    if (!order) {
      throw new Error('Não foi possível criar o pedido pendente.');
    }

    const orderId = String(order.id);

    for (const item of calculatedOrder.items) {
      await client.query(
        `
          INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
          )
        `,
        [
          orderId,
          item.productId,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
        ]
      );
    }

    const createdPaymentResult = await client.query<CreatedPaymentRow>(
      `
          INSERT INTO public.payments (
            order_id,
            amount,
            status,
            payment_method,
            mercadopago_status,
            external_reference,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            NOW(),
            NOW()
          )
          RETURNING id
        `,
      [
        orderId,
        calculatedOrder.totalAmount,
        'pending',
        checkout.payment.paymentMethodId,
        'pending',
        externalReference,
      ]
    );

    const paymentRecord = createdPaymentResult.rows[0];

    if (!paymentRecord) {
      throw new Error('Não foi possível criar o registro local do pagamento.');
    }

    await client.query('COMMIT');

    return {
      orderId,
      paymentRecordId: String(paymentRecord.id),
      externalReference,
      idempotencyKey,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Erro ao desfazer criação do pedido:', rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
}
