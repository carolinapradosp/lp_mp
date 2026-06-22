import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_PRD!);

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    /**
     * PEDIDO
     */
    const orderResult = await sql`
      SELECT
        o.id,

        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.customer_cpf,

        o.shipping_zip_code,
        o.shipping_street,
        o.shipping_number,
        o.shipping_complement,
        o.shipping_neighborhood,
        o.shipping_city,
        o.shipping_state,

        o.subtotal,
        o.shipping_cost,
        o.discount,
        o.total_amount,

        o.payment_method,
        o.status,

        o.created_at,
        o.updated_at,

        p.mercadopago_payment_id,
        p.mercadopago_status

      FROM public.orders o

      LEFT JOIN public.payments p
        ON p.order_id = o.id

      WHERE o.id = ${id}

      LIMIT 1
    `;

    const order = orderResult[0];

    if (!order) {
      return Response.json(
        {
          error: 'Pedido não encontrado',
        },
        {
          status: 404,
        }
      );
    }

    /**
     * ITENS
     */
    const items = await sql`
      SELECT
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,

        p.title,
        p.image_url

      FROM public.order_items oi

      LEFT JOIN public.products p
        ON p.id = oi.product_id

      WHERE oi.order_id = ${id}

      ORDER BY oi.id ASC
    `;

    return Response.json({
      order,
      items,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: 'Erro ao buscar pedido',
      },
      {
        status: 500,
      }
    );
  }
}
