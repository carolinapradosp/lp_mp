// components/admin/OrderCustomerCard.tsx

import { User } from 'lucide-react';
import InfoField from '../InfoField';

interface OrderCustomerCardProps {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_cpf: string;
}

export default function OrderCustomerCard({
    customer_name,
    customer_email,
    customer_phone,
    customer_cpf,
}: OrderCustomerCardProps) {
    return (
        <section
            className="
                rounded-xl
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
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                    "
                >
                    <User size={26} />
                </div>

                <div>
                    <h2 className="text-2xl font-black text-neutral-900">
                        Dados pessoais
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Informações do cliente
                    </p>
                </div>
            </div>

            {/* INFOS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InfoField
                    label="Nome completo"
                    value={customer_name}
                />

                <InfoField
                    label="E-mail"
                    value={customer_email}
                />

                <InfoField
                    label="Telefone"
                    value={customer_phone}
                />

                <InfoField
                    label="CPF"
                    value={customer_cpf}
                />
            </div>
        </section>
    );
}