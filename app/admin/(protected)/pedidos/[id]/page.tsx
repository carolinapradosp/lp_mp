//app/admin/pedidos/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Package,
    CalendarDays,
} from 'lucide-react';

import OrderCustomerCard from '@/components/AdminComponents/OrderCustomerCard';
import OrderShippingCard from '@/components/AdminComponents/OrderShippingCard';
import OrderProductsCard from '@/components/AdminComponents/OrderProductsCard';
import HeaderAdmin from '@/components/AdminComponents/HeaderAdmin';
import LoadingOverlay from '@/components/LoadingOverlay';

import { formatDateTimeBR } from '@/utils/date';

interface Order {
    id: number;

    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_cpf: string;

    shipping_zip_code: string;
    shipping_street: string;
    shipping_number: string;
    shipping_complement: string;
    shipping_neighborhood: string;
    shipping_city: string;
    shipping_state: string;

    subtotal: string;
    shipping_cost: string;
    discount: string;
    total_amount: string;

    payment_method: string;
    status: string;

    mercadopago_payment_id: string;
    mercadopago_status: string;

    created_at?: string;
}

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    title: string;
    image_url: string;
}

export default function OrderDetailsPage({
    params,
}: {
    params: Promise<{
        id: string;
    }>;
}) {
    const [order, setOrder] =
        useState<Order | null>(null);

    const [items, setItems] = useState<
        OrderItem[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const resolvedParams =
                    await params;

                const response = await fetch(
                    `/api/admin/orders/${resolvedParams.id}`
                );

                const data =
                    await response.json();

                setOrder(data.order);
                setItems(data.items);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [params]);

    function getStatusStyles(status: string) {
        switch (status) {
            case 'approved':
                return `
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-600
                `;

            case 'pending':
                return `
                    border-amber-200
                    bg-amber-50
                    text-amber-600
                `;

            case 'rejected':
                return `
                    border-red-200
                    bg-red-50
                    text-red-600
                `;

            case 'cancelled':
                return `
                    border-slate-200
                    bg-slate-100
                    text-slate-500
                `;

            default:
                return `
                    border-slate-200
                    bg-slate-100
                    text-slate-500
                `;
        }
    }

    if (!loading && !order) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="rounded-3xl border border-red-200 bg-white px-10 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <p className="text-lg font-semibold text-red-500">
                        Pedido não encontrado
                    </p>
                </div>
            </main>
        );
    }

    return (
        <>
            <LoadingOverlay
                visible={loading}
                message="Carregando pedido..."
            />

            <main className="min-h-screen bg-slate-50 px-4 py-6 lg:px-6">
                <div className="mx-auto max-w-480">

                    {/* HEADER */}
                    <div className="mb-8">
                        <HeaderAdmin />
                    </div>

                    {order && (
                        <>
                            {/* HERO */}
                            <section
                                className="
                                    mb-8
                                    overflow-hidden
                                    rounded-4xl
                                    border
                                    border-slate-200
                                    bg-white
                                    shadow-[0_20px_60px_rgba(15,23,42,0.06)]
                                "
                            >
                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-6
                                        border-b
                                        border-slate-200
                                        px-6
                                        py-6
                                        lg:flex-row
                                        lg:items-center
                                        lg:justify-between
                                        lg:px-8
                                    "
                                >
                                    <div className="flex items-start gap-4">
                                        <Link
                                            href="/admin/dashboard"
                                            className="
                                                flex
                                                h-14
                                                w-14
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                border
                                                border-slate-200
                                                bg-slate-50
                                                text-slate-700
                                                transition-all
                                                duration-300
                                                hover:border-blue-200
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                            "
                                        >
                                            <ArrowLeft size={22} />
                                        </Link>

                                        <div>
                                            <div className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                                                Detalhes do Pedido
                                            </div>

                                            <h1 className="text-4xl font-black text-slate-900">
                                                Pedido #{order.mercadopago_payment_id}
                                            </h1>

                                            <p className="mt-2 text-base text-slate-500">
                                                Visualize os dados completos da compra,
                                                pagamento e entrega.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <div
                                            className={`
                                                inline-flex
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                border
                                                px-5
                                                py-4
                                                text-sm
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                ${getStatusStyles(order.status)}
                                            `}
                                        >
                                            {order.status}
                                        </div>

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-2xl
                                                border
                                                border-slate-200
                                                bg-slate-50
                                                px-5
                                                py-4
                                            "
                                        >
                                            <CalendarDays
                                                size={18}
                                                className="text-slate-500"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Data
                                                </p>

                                                <p className="text-sm font-bold text-slate-700">
                                                    {order.created_at
                                                        ? formatDateTimeBR(order.created_at)
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RESUMO */}
                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-4
                                        px-6
                                        py-6
                                        md:grid-cols-3
                                        lg:px-8
                                    "
                                >
                                    <div
                                        className="
                                            rounded-3xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            p-5
                                        "
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-500">
                                                    Total do pedido
                                                </p>

                                                <h2 className="mt-2 text-3xl font-black text-slate-900">
                                                    {Number(
                                                        order.total_amount
                                                    ).toLocaleString(
                                                        'pt-BR',
                                                        {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                        }
                                                    )}
                                                </h2>
                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    h-14
                                                    w-14
                                                    items-center
                                                    justify-center
                                                    rounded-2xl
                                                    bg-blue-100
                                                "
                                            >
                                                <Package
                                                    className="text-blue-600"
                                                    size={28}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="
                                            rounded-3xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            p-5
                                        "
                                    >
                                        <p className="text-sm text-slate-500">
                                            Método de pagamento
                                        </p>

                                        <h3 className="mt-2 text-2xl font-black capitalize text-slate-900">
                                            {order.payment_method}
                                        </h3>

                                        <p className="mt-3 text-sm text-slate-500">
                                            Mercado Pago ID:
                                        </p>

                                        <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                                            {order.mercadopago_payment_id}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-3xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            p-5
                                        "
                                    >
                                        <p className="text-sm text-slate-500">
                                            Quantidade de itens
                                        </p>

                                        <h3 className="mt-2 text-3xl font-black text-slate-900">
                                            {items.length}
                                        </h3>

                                        <p className="mt-3 text-sm text-slate-500">
                                            Produtos vinculados ao pedido.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* GRID */}
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                                {/* LEFT */}
                                <div className="space-y-6 xl:col-span-2">
                                    <OrderCustomerCard
                                        customer_name={
                                            order.customer_name
                                        }
                                        customer_email={
                                            order.customer_email
                                        }
                                        customer_phone={
                                            order.customer_phone
                                        }
                                        customer_cpf={
                                            order.customer_cpf
                                        }
                                    />

                                    <OrderShippingCard
                                        shipping_zip_code={
                                            order.shipping_zip_code
                                        }
                                        shipping_street={
                                            order.shipping_street
                                        }
                                        shipping_number={
                                            order.shipping_number
                                        }
                                        shipping_complement={
                                            order.shipping_complement
                                        }
                                        shipping_neighborhood={
                                            order.shipping_neighborhood
                                        }
                                        shipping_city={
                                            order.shipping_city
                                        }
                                        shipping_state={
                                            order.shipping_state
                                        }
                                    />
                                </div>

                                {/* RIGHT */}
                                <div className="space-y-6">
                                    <OrderProductsCard
                                        items={items}
                                        subtotal={Number(
                                            order.subtotal
                                        )}
                                        shipping_cost={Number(
                                            order.shipping_cost
                                        )}
                                        discount={Number(
                                            order.discount
                                        )}
                                        total_amount={Number(
                                            order.total_amount
                                        )}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}