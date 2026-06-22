import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_PRD!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get('orderId') || '';

    const cpf = searchParams.get('cpf') || '';

    const email = searchParams.get('email') || '';
    const status = searchParams.get('status') || '';

    const totalOrdersResult = await sql`
  SELECT COUNT(*) as total
  FROM public.orders
`;

    const totalOrders = Number(totalOrdersResult[0].total);

    /**
     * Busca TODOS os pedidos
     */
    const orders = await sql`
      SELECT
        o.id,

        o.customer_name,
        o.customer_email,
        o.customer_cpf,

        o.total_amount,

        o.payment_method,

        o.status,

        o.created_at,

        o.mercadopago_external_id

      FROM public.orders o

      LEFT JOIN public.payments p
        ON p.order_id = o.id

      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    /**
     * Filtro manual no Node
     * Muito mais seguro/simples
     */
    const filteredOrders = orders.filter((order: any) => {
      const matchId =
        !orderId || order.id?.toLowerCase().includes(orderId.toLowerCase());

      const matchCpf =
        !cpf || order.customer_cpf?.toLowerCase().includes(cpf.toLowerCase());

      const matchEmail =
        !email ||
        order.customer_email?.toLowerCase().includes(email.toLowerCase());

      const matchStatus =
        !status || order.status?.toLowerCase().includes(status.toLowerCase());

      return matchId && matchCpf && matchEmail && matchStatus;
    });

    return Response.json({
      orders: filteredOrders,
      totalOrders,
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);

    return Response.json(
      {
        error: 'Erro ao buscar pedidos',
      },
      {
        status: 500,
      }
    );
  }
}
