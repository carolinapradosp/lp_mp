'use client';

import {
    ShoppingCart,
    CheckCircle,
    DollarSign,
} from 'lucide-react';

interface DashboardStatsProps {
    totalOrdersCount: number;
    approvedOrders: number;
    dailyRevenue: number;
}

export default function DashboardStats({
    totalOrdersCount,
    approvedOrders,
    dailyRevenue,
}: DashboardStatsProps) {
    return (
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {/* TOTAL PEDIDOS */}
            <div
                className="
                    rounded-[28px]
                    border
                    border-neutral-200
                    bg-white
                    p-6
                    shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                "
            >
                <div className="flex items-start justify-between gap-4">

                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Total de pedidos
                        </p>

                        <h2 className="mt-3 text-5xl font-black tracking-tight text-neutral-900">
                            {totalOrdersCount.toLocaleString('pt-BR')}
                        </h2>
                    </div>

                    <div
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-blue-50
                        "
                    >
                        <ShoppingCart
                            size={30}
                            className="text-blue-600"
                        />
                    </div>
                </div>
            </div>

            {/* APROVADOS */}
            <div
                className="
                    rounded-[28px]
                    border
                    border-neutral-200
                    bg-white
                    p-6
                    shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                "
            >
                <div className="flex items-start justify-between gap-4">

                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Pedidos aprovados do dia
                        </p>

                        <h2 className="mt-3 text-5xl font-black tracking-tight text-neutral-900">
                            {approvedOrders}
                        </h2>
                    </div>

                    <div
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-emerald-50
                        "
                    >
                        <CheckCircle
                            size={30}
                            className="text-emerald-600"
                        />
                    </div>
                </div>
            </div>

            {/* FATURAMENTO */}
            <div
                className="
                    rounded-[28px]
                    border
                    border-neutral-200
                    bg-white
                    p-6
                    shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                "
            >
                <div className="flex items-start justify-between gap-4">

                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Faturamento do dia
                        </p>

                        <h2 className="mt-3 text-4xl font-black tracking-tight text-neutral-900">
                            {dailyRevenue.toLocaleString(
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
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-violet-50
                        "
                    >
                        <DollarSign
                            size={30}
                            className="text-violet-600"
                        />
                    </div>
                </div>
            </div>

        </section>
    );
}