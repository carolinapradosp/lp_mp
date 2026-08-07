// components/AdminComponents/Products/ProductStatusSwitch.tsx

'use client';

import { useFormStatus } from 'react-dom';

import { toggleProductStatus } from '@/app/admin/(protected)/products/actions';

type ProductStatusSwitchProps = {
    productId: string;
    productTitle: string;
    active: boolean;
};

function SwitchButton({
    productTitle,
    active,
}: {
    productTitle: string;
    active: boolean;
}) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            role="switch"
            aria-checked={active}
            aria-label={
                active
                    ? `Desativar ${productTitle}`
                    : `Ativar ${productTitle}`
            }
            title={active ? 'Desativar' : 'Ativar'}
            disabled={pending}
            className={`
                relative inline-flex h-6 w-11 shrink-0
                items-center rounded-full
                transition-colors duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-slate-500
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${active
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
                }
            `}
        >
            <span
                aria-hidden="true"
                className={`
                    pointer-events-none block size-5
                    rounded-full bg-white shadow-sm
                    transition-transform duration-200
                    ${active
                        ? 'translate-x-5 ml-0.5'
                        : 'translate-x-0.5'
                    }
                `}
            />
        </button>
    );
}

export default function ProductStatusSwitch({
    productId,
    productTitle,
    active,
}: ProductStatusSwitchProps) {
    return (
        <form action={toggleProductStatus}>
            <input
                type="hidden"
                name="product_id"
                value={productId}
            />

            <input
                type="hidden"
                name="current_status"
                value={String(active)}
            />

            <SwitchButton
                productTitle={productTitle}
                active={active}
            />
        </form>
    );
}