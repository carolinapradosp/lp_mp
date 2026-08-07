"use client";

import LoadingOverlay from "@/components/LoadingOverlay";
import OrdersFilters from "@/components/AdminComponents/OrdersFilters";
import DashboardStats from "@/components/AdminComponents/DashboardStats";
import OrdersTable from "@/components/AdminComponents/OrdersTable";
import type { Order } from "@/interfaces/Order";
import { useOrders } from "@/hooks/useOrders";


interface DashboardContentProps {
    initialOrders: Order[];
    initialTotalOrders: number;
}

export default function DashboardContent({
    initialOrders,
    initialTotalOrders,
}: DashboardContentProps) {
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
    } = useOrders({
        initialOrders,
        initialTotalOrders,
    });

    return (
        <>
            <LoadingOverlay
                visible={loading}
                message="Carregando pedidos..."
            />

            <DashboardStats
                totalOrdersCount={totalOrdersCount}
                approvedOrders={approvedOrders}
                dailyRevenue={dailyRevenue}
            />

            <section
                aria-labelledby="orders-title"
                className="
          rounded-xl
          border border-neutral-200
          bg-white
          p-5
          shadow-md
          lg:p-8
        "
            >
                <div className="mb-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h2
                            id="orders-title"
                            className="text-3xl font-black text-neutral-900"
                        >
                            Pedidos
                        </h2>

                        <p className="text-base text-neutral-500">
                            Consulte os pedidos realizados na loja
                        </p>

                        <div
                            aria-live="polite"
                            className="mt-2 inline-flex w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600"
                        >
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
        </>
    );
}