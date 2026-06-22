// components/admin/OrdersTable.tsx

import { Order } from '@/interfaces/Order';
import { formatDateBR } from '@/utils/date';
import { useRouter } from 'next/navigation';

interface OrdersTableProps {
    orders: Order[];
    loading?: boolean;
}

// Centralização de Configurações de Status (Tradução + Estilos)
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    approved: {
        label: 'Aprovado',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    pending: {
        label: 'Pendente',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    in_process: {
        label: 'Em Processo',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    rejected: {
        label: 'Recusado',
        className: 'bg-red-50 text-red-700 border-red-200',
    },
    cancelled: {
        label: 'Cancelado',
        className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    },
    charged_back: {
        label: 'Contestado',
        className: 'bg-neutral-200 text-neutral-900 border-neutral-900',
    },
    refunded: {
        label: 'Reembolsado',
        className: 'bg-cyan-100 text-cyan-600 border-cyan-300',
    },
};

// Fallback padrão caso venha algum status desconhecido da API
const DEFAULT_STATUS = {
    label: 'Desconhecido',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

export default function OrdersTable({
    orders,
    loading = false,
}: OrdersTableProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="py-20 text-center text-neutral-500">
                Carregando pedidos...
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="py-20 text-center text-neutral-400">
                Nenhum pedido encontrado
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-3xl border border-neutral-200">
            <table className="w-full min-w-225 bg-white">
                <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="p-5 text-left text-sm font-bold uppercase tracking-wide text-neutral-500">
                            Pedido
                        </th>
                        <th className="p-5 text-left text-sm font-bold uppercase tracking-wide text-neutral-500">
                            Cliente
                        </th>
                        <th className="p-5 text-left text-sm font-bold uppercase tracking-wide text-neutral-500">
                            Status
                        </th>
                        <th className="p-5 text-left text-sm font-bold uppercase tracking-wide text-neutral-500">
                            Valor
                        </th>
                        <th className="p-5 text-left text-sm font-bold uppercase tracking-wide text-neutral-500">
                            Data
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => {
                        // Obtém a configuração do status atual ou usa o fallback padrão
                        const statusInfo = STATUS_CONFIG[order.status] || DEFAULT_STATUS;

                        return (
                            <tr
                                key={order.id}
                                onClick={() => router.push(`/admin/pedidos/${order.id}`)}
                                className={`
                                    cursor-pointer
                                    border-b
                                    border-neutral-100
                                    transition-all
                                    hover:bg-blue-50/50
                                    ${index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfd]'}
                                `}
                            >
                                {/* PEDIDO */}
                                <td className="p-5">
                                    <span className="font-bold text-blue-600">
                                        #{order.mercadopago_external_id}
                                    </span>
                                </td>

                                {/* CLIENTE */}
                                <td className="p-5">
                                    <div>
                                        <p className="font-semibold text-neutral-900">
                                            {order.customer_name}
                                        </p>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            {order.customer_email}
                                        </p>
                                    </div>
                                </td>

                                {/* STATUS */}
                                <td className="p-5">
                                    <span
                                        className={`
                                            inline-flex
                                            rounded-full
                                            border
                                            px-3
                                            py-1
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            ${statusInfo.className}
                                        `}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </td>

                                {/* VALOR */}
                                <td className="p-5">
                                    <strong className="text-base font-black text-neutral-900">
                                        {Number(order.total_amount).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })}
                                    </strong>
                                </td>

                                {/* DATA */}
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