'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import OrdersFilters from '@/components/AdminComponents/OrdersFilters';
import DashboardStats from '@/components/AdminComponents/DashboardStats';
import OrdersTable from '@/components/AdminComponents/OrdersTable';
import { useOrders } from '@/hooks/useOrders';
import HeaderAdmin from '@/components/AdminComponents/HeaderAdmin';
import { useEffect } from 'react';

export default function DashboardPage() {

    const {
        orders,
        loading,
        filters,
        setFilters,
        totalOrdersCount,
        approvedOrders,
        dailyRevenue,
        fetchOrders,
        clearFilters,
    } = useOrders();

    useEffect(() => {
        const intervalId = setInterval(() => {
            window.location.reload();
        }, 300000); // 300000ms = 5 minutos

        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <LoadingOverlay
                visible={loading}
                message="Carregando pedidos..."
            />

            <main className="min-h-screen bg-[#f5f7fb] p-4 lg:p-8">
                <div className="mx-auto max-w-7xl">

                    <HeaderAdmin />

                    <DashboardStats
                        totalOrdersCount={totalOrdersCount}
                        approvedOrders={approvedOrders}
                        dailyRevenue={dailyRevenue}
                    />

                    {/* TABELA */}
                    <section
                        className="
                            rounded-4xl
                            border
                            border-neutral-200
                            bg-white
                            p-5
                            shadow-[0_10px_40px_rgba(15,23,42,0.04)]
                            lg:p-8
                        "
                    >
                        <div className="mb-8 flex flex-col gap-6">

                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black text-neutral-900">
                                    Pedidos
                                </h2>

                                <p className="text-base text-neutral-500">
                                    Consulte os pedidos realizados na loja
                                </p>

                                <div className="mt-2 inline-flex w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                                    {orders.length} resultado(s) encontrado(s)
                                </div>
                            </div>

                            <OrdersFilters
                                filters={filters}
                                setFilters={setFilters}
                                onSearch={fetchOrders}
                                onClear={clearFilters}
                            />
                        </div>

                        <OrdersTable
                            orders={orders}
                            loading={loading}
                        />
                    </section>

                </div>
            </main>
        </>
    );
}