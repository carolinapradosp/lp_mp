import Link from "next/link";
import type { Order } from "@/interfaces/Order";
import { formatDateBR } from "@/utils/date";

interface OrdersTableProps {
    orders: Order[];
    loading?: boolean;
}

type StatusConfig = {
    label: string;
    className: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
    approved: {
        label: "Aprovado",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    pending: {
        label: "Pendente",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    in_process: {
        label: "Em processo",
        className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    rejected: {
        label: "Recusado",
        className: "bg-red-50 text-red-700 border-red-200",
    },
    cancelled: {
        label: "Cancelado",
        className: "bg-neutral-100 text-neutral-600 border-neutral-200",
    },
    charged_back: {
        label: "Contestado",
        className: "bg-neutral-200 text-neutral-900 border-neutral-900",
    },
    refunded: {
        label: "Reembolsado",
        className: "bg-cyan-100 text-cyan-600 border-cyan-300",
    },
};

const DEFAULT_STATUS: StatusConfig = {
    label: "Desconhecido",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export default function OrdersTable({
    orders,
    loading = false,
}: OrdersTableProps) {
    if (loading) {
        return (
            <div
                role="status"
                className="py-20 text-center text-neutral-500"
            >
                Carregando pedidos...
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="py-20 text-center text-neutral-400">
                Nenhum pedido encontrado
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-3xl border border-neutral-200">
            <table className="w-full min-w-225 bg-white">
                <caption className="sr-only">
                    Lista de pedidos realizados na loja
                </caption>

                <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th scope="col" className={headerClass}>
                            Pedido
                        </th>

                        <th scope="col" className={headerClass}>
                            Cliente
                        </th>

                        <th scope="col" className={headerClass}>
                            Status
                        </th>

                        <th scope="col" className={headerClass}>
                            Valor
                        </th>

                        <th scope="col" className={headerClass}>
                            Data
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order, index) => {
                        const statusInfo =
                            STATUS_CONFIG[order.status] ?? DEFAULT_STATUS;

                        const orderUrl = `/admin/pedidos/${order.id}`;

                        return (
                            <tr
                                key={order.id}
                                className={`
                  border-b border-neutral-100
                  transition-colors hover:bg-blue-50/50
                  ${index % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"}
                `}
                            >
                                <td className="p-5">
                                    <Link
                                        href={orderUrl}
                                        className="
                      font-bold text-blue-600
                      underline-offset-4
                      hover:underline
                      focus-visible:rounded
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-blue-600
                    "
                                    >
                                        #{order.mercadopago_external_id}
                                    </Link>
                                </td>

                                <td className="p-5">
                                    <p className="font-semibold text-neutral-900">
                                        {order.customer_name}
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        {order.customer_email}
                                    </p>
                                </td>

                                <td className="p-5">
                                    <span
                                        className={`
                      inline-flex rounded-full border
                      px-3 py-1
                      text-xs font-bold uppercase tracking-wide
                      ${statusInfo.className}
                    `}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </td>

                                <td className="p-5">
                                    <strong className="text-base font-black text-neutral-900">
                                        {currencyFormatter.format(
                                            Number(order.total_amount),
                                        )}
                                    </strong>
                                </td>

                                <td className="p-5 text-sm font-medium text-neutral-500">
                                    {formatDateBR(order.created_at)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

const headerClass =
    "p-5 text-left text-sm font-bold uppercase tracking-wide text-neutral-500";