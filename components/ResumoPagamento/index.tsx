import { formatCurrency } from "@/utils/utils";
import {
    ShieldCheck,
    CreditCard,
    Truck,
    BadgeDollarSign,
} from "lucide-react";

type ResumoPagamentoProps = {
    products: {
        id: string;
        title: string;
        quantity: number;
        price: number;
    }[];
    shippingCost: number;
    amount: number;
};

export default function ResumoPagamento({
    products,
    shippingCost,
    amount
}: ResumoPagamentoProps) {

    const subtotal = products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 mb-6 shadow-sm">

            {/* RESUMO */}
            <div className="space-y-5">

                <div className="flex items-center justify-between">
                    <span className="text-neutral-500">
                        Subtotal
                    </span>

                    <strong className="text-lg font-bold text-neutral-900">
                        {formatCurrency(subtotal)}
                    </strong>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-neutral-500">
                        <Truck size={18} />
                        Frete
                    </span>

                    <strong className="text-lg font-bold text-neutral-900">
                        {formatCurrency(shippingCost)}
                    </strong>
                </div>

            </div>

            {/* DIVIDER */}
            <div className="my-6 h-px bg-neutral-200" />

            {/* TOTAL */}
            <div className="flex items-end justify-between">

                <div>
                    <span className="block text-sm font-medium text-neutral-500">
                        Total do pedido
                    </span>

                    <p className="mt-1 text-xs text-neutral-400">
                        Em até 12x no cartão
                    </p>
                </div>

                <strong className="text-4xl font-black tracking-tight text-blue-600">
                    {formatCurrency(amount)}
                </strong>

            </div>

            {/* BENEFÍCIOS */}
            <div className="mt-8 grid gap-3">

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <ShieldCheck
                        size={20}
                        className="text-emerald-600"
                    />

                    <div>
                        <p className="text-sm font-bold text-neutral-900">
                            Pagamento seguro
                        </p>

                        <span className="text-xs text-neutral-500">
                            Seus dados protegidos
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <CreditCard
                        size={20}
                        className="text-blue-600"
                    />

                    <div>
                        <p className="text-sm font-bold text-neutral-900">
                            Parcelamento disponível
                        </p>

                        <span className="text-xs text-neutral-500">
                            Até 12x no cartão
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <BadgeDollarSign
                        size={20}
                        className="text-orange-500"
                    />

                    <div>
                        <p className="text-sm font-bold text-neutral-900">
                            PIX instantâneo
                        </p>

                        <span className="text-xs text-neutral-500">
                            Aprovação rápida
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
}