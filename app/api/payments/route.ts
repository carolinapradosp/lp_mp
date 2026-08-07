// app/api/payments/route.ts

import { NextResponse } from 'next/server';
import { isCheckoutError, CheckoutError } from '@/lib/checkout/checkout-error';
import { parseCheckoutInput } from '@/lib/checkout/parse-checkout-input';
import { calculateOrder } from '@/lib/checkout/calculate-order';
import { createPendingOrder } from '@/lib/orders/create-pending-order';
import { savePaymentResult } from '@/lib/orders/payment-updates';
import { createMercadoPagoPayment } from '@/lib/mercadopago/create-payment';
import { deletePendingOrder } from '@/lib/orders/delete-pending-order';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let pendingOrder: Awaited<ReturnType<typeof createPendingOrder>> | undefined;

  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw new CheckoutError({
        code: 'INVALID_JSON',
        message: 'O corpo da requisição é inválido.',
        statusCode: 400,
      });
    }

    const checkout = parseCheckoutInput(rawBody);

    const calculatedOrder = await calculateOrder(checkout.items);

    pendingOrder = await createPendingOrder({
      checkout,
      calculatedOrder,
    });

    let mercadoPagoPayment;

    try {
      mercadoPagoPayment = await createMercadoPagoPayment({
        checkout,
        calculatedOrder,
        pendingOrder,
      });
    } catch (error) {
      console.error('Erro ao criar pagamento no Mercado Pago:', error);

      /*
       * O Mercado Pago não criou um pagamento.
       *
       * Portanto esse registro ainda não é um pedido
       * válido para o sistema e deve ser removido.
       */
      try {
        await deletePendingOrder({
          pendingOrder,
        });
      } catch (cleanupError) {
        console.error(
          'CRÍTICO: falha ao remover pedido após erro na criação do pagamento:',
          {
            cleanupError,

            orderId: pendingOrder.orderId,

            externalReference: pendingOrder.externalReference,

            paymentRecordId: pendingOrder.paymentRecordId,
          }
        );
      }

      throw new CheckoutError({
        code: 'PAYMENT_CREATION_FAILED',

        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível criar o pagamento.',

        statusCode: isCheckoutError(error) ? error.statusCode : 502,
      });
    }

    try {
      await savePaymentResult({
        pendingOrder,

        payment: {
          id: mercadoPagoPayment.id,

          status: mercadoPagoPayment.status,

          paymentMethodId: mercadoPagoPayment.paymentMethodId,

          transactionAmount: mercadoPagoPayment.transactionAmount,

          pixQrCode: mercadoPagoPayment.pixQrCode,

          pixExpirationAt: mercadoPagoPayment.pixExpirationAt,
        },
      });
    } catch (error) {
      console.error('Pagamento criado, mas não persistido localmente:', {
        error,

        mercadoPagoPaymentId: mercadoPagoPayment.id,

        orderId: pendingOrder.orderId,

        externalReference: pendingOrder.externalReference,

        confirmationToken: pendingOrder.confirmationToken,
      });

      return NextResponse.json(
        {
          error:
            'O pagamento foi criado, mas houve uma falha ao registrar sua confirmação.',

          code: 'PAYMENT_CREATED_PERSISTENCE_FAILED',

          paymentId: mercadoPagoPayment.id,

          externalReference: pendingOrder.externalReference,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        id: mercadoPagoPayment.id,

        status: mercadoPagoPayment.status,

        amount: mercadoPagoPayment.transactionAmount,

        externalReference: pendingOrder.externalReference,

        confirmationToken: pendingOrder.confirmationToken,

        pixExpirationAt: mercadoPagoPayment.pixExpirationAt,

        point_of_interaction: mercadoPagoPayment.pointOfInteraction,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('Erro no checkout:', error);

    if (isCheckoutError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        {
          status: error.statusCode,
        }
      );
    }

    return NextResponse.json(
      {
        error: 'Não foi possível concluir o checkout.',

        code: 'INTERNAL_CHECKOUT_ERROR',
      },
      {
        status: 500,
      }
    );
  }
}
