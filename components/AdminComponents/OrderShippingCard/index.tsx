// components/admin/OrderShippingCard.tsx

import { MapPin } from 'lucide-react';
import InfoField from '../InfoField';

interface OrderShippingCardProps {
    shipping_zip_code: string;
    shipping_street: string;
    shipping_number: string;
    shipping_complement: string;
    shipping_neighborhood: string;
    shipping_city: string;
    shipping_state: string;
}

export default function OrderShippingCard({
    shipping_zip_code,
    shipping_street,
    shipping_number,
    shipping_complement,
    shipping_neighborhood,
    shipping_city,
    shipping_state,
}: OrderShippingCardProps) {
    return (
        <section
            className="
                rounded-xl
                border
                border-neutral-200
                bg-white
                p-6
                shadow-md
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
                        bg-emerald-50
                        text-emerald-600
                    "
                >
                    <MapPin size={26} />
                </div>

                <div>
                    <h2 className="text-2xl font-black text-neutral-900">
                        Endereço de entrega
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Dados de envio do pedido
                    </p>
                </div>
            </div>

            {/* INFOS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InfoField
                    label="CEP"
                    value={shipping_zip_code}
                />

                <InfoField
                    label="Rua / Avenida"
                    value={shipping_street}
                />

                <InfoField
                    label="Número"
                    value={shipping_number}
                />

                <InfoField
                    label="Complemento"
                    value={shipping_complement || '-'}
                />

                <InfoField
                    label="Bairro"
                    value={shipping_neighborhood || '-'}
                />

                <InfoField
                    label="Cidade / Estado"
                    value={`${shipping_city} - ${shipping_state}`}
                />
            </div>
        </section>
    );
}