// components/admin/OrderProductsCard.tsx

import { Package } from 'lucide-react';
import ResumeLine from '../ResumeLine';

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    title: string;
    image_url: string;
}

interface OrderProductsCardProps {
    items: OrderItem[];

    subtotal: number;
    shipping_cost: number;
    discount: number;
    total_amount: number;
}

export default function OrderProductsCard({
    items,
    subtotal,
    shipping_cost,
    discount,
    total_amount,
}: OrderProductsCardProps) {

    return (
        <section
            className="
                rounded-4xl
                border
                border-neutral-200
                bg-white
                p-6
                shadow-[0_10px_35px_rgba(15,23,42,0.04)]
            "
        >

            {/* HEADER */}
            <div className="mb-8 flex items-center gap-4">

                <div
                    className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-blue-50
                        text-blue-600
                    "
                >
                    <Package size={26} />
                </div>

                <div>
                    <h2 className="text-2xl font-black text-neutral-900">
                        Produtos
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Itens do pedido
                    </p>
                </div>

            </div>

            {/* LISTA */}
            <div className="space-y-4">

                {items.map((item) => (

                    <div
                        key={item.id}
                        className="
                            rounded-2xl
                            border
                            border-neutral-200
                            bg-[#fafafa]
                            p-5
                            transition-all
                            hover:border-blue-200
                            hover:bg-blue-50/30
                        "
                    >

                        <div className="flex items-center justify-between gap-4">

                            <div className="flex-1">

                                <h3 className="text-base font-bold text-neutral-900">
                                    {item.title} x{item.quantity}
                                </h3>
                            </div>

                            <div className="text-right">

                                <strong className="mt-1 block text-xl font-black text-blue-600">
                                    {Number(
                                        item.total_price
                                    ).toLocaleString(
                                        'pt-BR',
                                        {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            {/* RESUMO */}
            <div
                className="
                    mt-8
                    rounded-3xl
                    border
                    border-neutral-200
                    bg-[#fafafa]
                    p-5
                "
            >

                <div className="space-y-4">

                    <ResumeLine
                        label="Subtotal"
                        value={subtotal}
                    />

                    <ResumeLine
                        label="Frete"
                        value={shipping_cost}
                    />

                    <ResumeLine
                        label="Desconto"
                        value={discount}
                    />

                </div>

                {/* TOTAL */}
                <div
                    className="
                        mt-6
                        flex
                        items-center
                        justify-between
                        border-t
                        border-neutral-200
                        pt-6
                    "
                >

                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Valor total
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                            Total final do pedido
                        </p>
                    </div>

                    <strong className="text-4xl font-black tracking-tight text-neutral-900">
                        {total_amount.toLocaleString(
                            'pt-BR',
                            {
                                style: 'currency',
                                currency: 'BRL',
                            }
                        )}
                    </strong>

                </div>

            </div>

        </section>
    );
}