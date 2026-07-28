// lib/mercadopago/create-payment.ts

import { mercadoPagoPayment } from './client';
import { CheckoutError } from '@/lib/checkout/checkout-error';

import type { CalculatedOrder, CheckoutInput } from '@/lib/checkout/types';

import type { PendingOrder } from '@/lib/orders/create-pending-order';
import type { MPStatus } from './payment-status';

type MercadoPagoCreatedPayment = {
  id: string;
  status: MPStatus;
  paymentMethodId: string;
  transactionAmount: number;
  pointOfInteraction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
};

function splitPhone(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '');

  return {
    areaCode: cleanPhone.slice(0, 2),
    number: cleanPhone.slice(2),
  };
}

export async function createMercadoPagoPayment({
  checkout,
  calculatedOrder,
  pendingOrder,
}: {
  checkout: CheckoutInput;
  calculatedOrder: CalculatedOrder;
  pendingOrder: PendingOrder;
}): Promise<MercadoPagoCreatedPayment> {
  const { areaCode, number } = splitPhone(checkout.customer.phone);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new CheckoutError({
      code: 'MISSING_BASE_URL',
      message: 'A URL pública da aplicação não está configurada.',
      statusCode: 500,
    });
  }

  const result = await mercadoPagoPayment.create({
    body: {
      transaction_amount: calculatedOrder.totalAmount,

      description: `Pedido ${pendingOrder.externalReference}`,

      payment_method_id: checkout.payment.paymentMethodId,

      issuer_id:
        checkout.payment.issuerId !== undefined
          ? Number(checkout.payment.issuerId)
          : undefined,

      token: checkout.payment.token,

      installments: checkout.payment.installments ?? 1,

      capture: true,
      binary_mode: false,

      external_reference: pendingOrder.externalReference,

      payer: {
        email: checkout.customer.email,

        first_name: checkout.customer.firstName,

        last_name: checkout.customer.lastName,

        identification: {
          type: checkout.customer.identification.type,

          number: checkout.customer.identification.number,
        },

        address: {
          zip_code: checkout.customer.address.zipCode,

          street_name: checkout.customer.address.streetName,

          street_number: checkout.customer.address.streetNumber,
        },
      },

      additional_info: {
        items: calculatedOrder.items.map((item) => ({
          id: item.productId,
          title: item.title,

          description: item.description ?? item.title,

          category_id: 'health_beauty',

          quantity: item.quantity,

          unit_price: item.unitPrice,

          picture_url: item.imageUrl ?? undefined,
        })),

        payer: {
          first_name: checkout.customer.firstName,

          last_name: checkout.customer.lastName,

          phone: {
            area_code: areaCode,
            number,
          },

          address: {
            zip_code: checkout.customer.address.zipCode,

            street_name: checkout.customer.address.streetName,

            street_number: checkout.customer.address.streetNumber,
          },
        },

        shipments: {
          receiver_address: {
            zip_code: checkout.customer.address.zipCode,

            state_name: checkout.customer.address.federalUnit,

            city_name: checkout.customer.address.city,

            street_name: checkout.customer.address.streetName,

            street_number: checkout.customer.address.streetNumber,

            floor: checkout.customer.address.complement ?? '',

            apartment: checkout.customer.address.complement ?? '',
          },
        },
      },

      statement_descriptor: 'EXPRESS-PH',

      notification_url: `${baseUrl}/api/webhooks/mercadopago`,

      metadata: {
        order_id: pendingOrder.orderId,

        external_reference: pendingOrder.externalReference,

        customer_email: checkout.customer.email,

        customer_cpf: checkout.customer.identification.number,

        customer_name: [checkout.customer.firstName, checkout.customer.lastName]
          .filter(Boolean)
          .join(' '),

        customer_phone: checkout.customer.phone,

        shipping_city: checkout.customer.address.city,

        shipping_state: checkout.customer.address.federalUnit,

        shipping_zip_code: checkout.customer.address.zipCode,
      },
    },

    requestOptions: {
      idempotencyKey: pendingOrder.idempotencyKey,
    },
  });

  if (!result.id) {
    throw new CheckoutError({
      code: 'MERCADOPAGO_PAYMENT_WITHOUT_ID',
      message: 'O Mercado Pago não retornou o identificador do pagamento.',
      statusCode: 502,
    });
  }

  const transactionAmount = Number(result.transaction_amount);

  if (!Number.isFinite(transactionAmount)) {
    throw new CheckoutError({
      code: 'INVALID_MERCADOPAGO_AMOUNT',
      message: 'O Mercado Pago retornou um valor de pagamento inválido.',
      statusCode: 502,
    });
  }

  return {
    id: String(result.id),

    status: (result.status as MPStatus) ?? 'pending',

    paymentMethodId:
      result.payment_method_id ?? checkout.payment.paymentMethodId,

    transactionAmount,

    pointOfInteraction: result.point_of_interaction,
  };
}
