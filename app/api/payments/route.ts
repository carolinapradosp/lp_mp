//app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL_PRD!);

    const body = await request.json();
    const products = body.products || [];

    const customer = body.customer;
    const firstName = customer.firstName || 'Cliente';
    const lastName = customer.lastName || 'Silva';

    const payment = new Payment(client);
    const orderExternalReference = crypto.randomUUID();

    // CRIA PAGAMENTO PRIMEIRO
    const cleanPhone = customer.phone?.replace(/\D/g, '') || '';

    const areaCode = cleanPhone.substring(0, 2);
    const phoneNumber = cleanPhone.substring(2);

    const paymentData = {
      body: {
        transaction_amount: Number(body.transaction_amount),
        description: 'Pedido EP' + orderExternalReference,
        payment_method_id: body.payment_method_id,
        issuer_id: body.issuer_id ? Number(body.issuer_id) : undefined,
        token: body.token,
        installments: body.installments ? Number(body.installments) : 1,
        capture: true,
        binary_mode: false,
        external_reference: orderExternalReference,
        payer: {
          email: customer.email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: customer.identification.type,
            number: customer.identification.number,
          },
          address: {
            zip_code: customer.address.zipCode?.replace(/\D/g, ''),
            street_name: customer.address.streetName,
            street_number: customer.address.streetNumber,
          },
        },

        additional_info: {
          items: products.map((product: any) => ({
            id: String(product.id),
            title: `Produto ${product.id}`,
            description: 'Produto Express - Suplementos' + product.id,
            category_id: 'health_beauty',
            quantity: Number(product.quantity),
            unit_price: Number(product.price),
            picture_url: process.env.NEXT_PUBLIC_BASE_URL + `/sup.jpg`,
          })),

          payer: {
            first_name: firstName,
            last_name: lastName,
            phone: {
              area_code: areaCode,
              number: phoneNumber,
            },
            address: {
              zip_code: customer.address.zipCode?.replace(/\D/g, ''),
              street_name: customer.address.streetName,
              street_number: customer.address.streetNumber,
            },
          },
          shipments: {
            receiver_address: {
              zip_code: customer.address.zipCode?.replace(/\D/g, ''),
              street_name: customer.address.streetName,
              street_number: customer.address.streetNumber,
              apartment: customer.address.complement || '',
            },
          },
        },
        statement_descriptor: 'EXPRESS-PH',
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
        metadata: {
          user_id: customer.email,
          order_id: orderExternalReference,
          customer_email: customer.email,
          customer_cpf: customer.identification.number,
          customer_name: `${firstName} ${lastName}`,
          customer_phone: customer.phone,
          shipping_city: customer.address.city,
          shipping_state: customer.address.federalUnit,
          shipping_zip_code: customer.address.zipCode,
        },
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
      },
    };

    console.log('📦 PAYMENT DATA:', JSON.stringify(paymentData, null, 2));

    const res = await payment.create(paymentData);

    // SOMENTE APÓS PAGAMENTO CRIADO:
    // salva pedido
    const createdOrder = await sql`
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
mercadopago_external_id,
external_reference
      )
      VALUES (
        ${customer.firstName + ' ' + customer.lastName},
        ${customer.email},
        ${customer.phone},
        ${customer.identification.number},

        ${customer.address.zipCode},
        ${customer.address.streetName},
        ${customer.address.streetNumber},
        ${customer.address.complement},
        ${customer.address.neighborhood},
        ${customer.address.city},
        ${customer.address.federalUnit},

        ${Number(body.transaction_amount)},
        ${body.shippingCost ? Number(body.shippingCost) : 0},
        ${0},
        ${Number(body.transaction_amount)},

        ${body.payment_method_id},
        ${res.status},

        ${res.id?.toString()},
        ${orderExternalReference}
      )
      RETURNING id
    `;

    const orderId = createdOrder[0].id;

    // salva itens
    for (const product of products) {
      await sql`
        INSERT INTO public.order_items (
          order_id,
          product_id,
          quantity,
          unit_price,
          total_price
        )
        VALUES (
          ${orderId},
          ${product.id},
          ${Number(product.quantity)},
          ${Number(product.price)},
          ${Number(product.price) * Number(product.quantity)}
        )
      `;
    }

    // salva pagamento
    await sql`
      INSERT INTO public.payments (
        order_id,
        amount,
        status,
        payment_method,
        mercadopago_payment_id,
        mercadopago_status,
        external_reference
      )
      VALUES (
        ${orderId},
        ${res.transaction_amount},
        ${res.status},
        ${res.payment_method_id},
        ${res.id?.toString()},
        ${res.status},
        ${orderExternalReference}
      )
    `;

    return NextResponse.json({
      status: res.status,
      id: res.id,
      point_of_interaction: res.point_of_interaction,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);

    return NextResponse.json(
      {
        error: error.message || 'Erro interno',
      },
      {
        status: 500,
      }
    );
  }
}
