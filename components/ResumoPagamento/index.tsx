// components/ResumoPagamento/index.tsx
import { formatCurrency } from "@/utils/utils";
import {
    ShieldCheck,
    CreditCard,
    Zap,
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
        <div className="border border-[var(--color-brand-border)] bg-white p-6">

            {/* VALORES DO RESUMO */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-brand-muted)]">
                        Subtotal
                    </span>
                    <span className="text-sm font-medium text-[var(--color-brand-dark)]">
                        {formatCurrency(subtotal)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-brand-muted)]">
                        Frete
                    </span>
                    <span className="text-sm font-medium text-[var(--color-brand-dark)]">
                        {shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}
                    </span>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="my-5 h-px bg-[var(--color-brand-border)]" />

            {/* VALOR TOTAL EXIBIDO */}
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-sm font-medium uppercase tracking-wider text-[var(--color-brand-dark)]">
                        Total
                    </span>
                    <p className="mt-0.5 text-xs text-[var(--color-brand-muted)]">
                        Disponível em até 12x
                    </p>
                </div>

                <strong className="text-2xl font-bold tracking-tight text-[var(--color-brand-dark)]">
                    {formatCurrency(amount)}
                </strong>
            </div>

            {/* COMPONENTES DE BENEFÍCIO DO CHECKOUT */}
            <div className="mt-8 space-y-3 border-t border-[var(--color-brand-border)] pt-6">

                {/* SEGURANÇA */}
                <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="mt-0.5 text-[var(--color-brand-dark)] shrink-0" />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-dark)] leading-tight">
                            Ambiente Criptografado
                        </p>
                        <span className="mt-0.5 block text-xs text-[var(--color-brand-muted)]">
                            Seus dados pessoais e de pagamento totalmente protegidos.
                        </span>
                    </div>
                </div>

                {/* PARCELAMENTO */}
                <div className="flex items-start gap-3">
                    <CreditCard size={16} className="mt-0.5 text-[var(--color-brand-dark)] shrink-0" />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-dark)] leading-tight">
                            Até 12x no Cartão
                        </p>
                        <span className="mt-0.5 block text-xs text-[var(--color-brand-muted)]">
                            Aceitamos as principais bandeiras com aprovação em tempo real.
                        </span>
                    </div>
                </div>

                {/* PIX */}
                <div className="flex items-start gap-3">
                    <Zap size={16} className="mt-0.5 text-[var(--color-brand-dark)] shrink-0" />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-dark)] leading-tight">
                            PIX Instantâneo
                        </p>
                        <span className="mt-0.5 block text-xs text-[var(--color-brand-muted)]">
                            Gere o QR Code na próxima etapa para envio imediato.
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
}