// components/AdminComponents/Products/ProductActions.tsx

'use client';

import {
    FormEvent,
    useActionState,
} from 'react';

import { FiEdit2, FiTrash2 } from 'react-icons/fi';

import {
    deleteProduct,
    type DeleteProductState,
} from '@/app/admin/(protected)/products/actions';
import Link from 'next/link';

type ProductActionsProps = {
    productId: string;
    productTitle: string;
};

const initialDeleteState: DeleteProductState = {
    success: false,
    message: '',
};

export default function ProductActions({
    productId,
    productTitle,
}: ProductActionsProps) {
    const [deleteState, deleteAction, deletePending] =
        useActionState(
            deleteProduct,
            initialDeleteState,
        );

    function handleDeleteSubmit(
        event: FormEvent<HTMLFormElement>,
    ): void {
        const confirmed = window.confirm(
            `Tem certeza que deseja excluir "${productTitle}"?\n\nEssa ação não poderá ser desfeita.`,
        );

        if (!confirmed) {
            event.preventDefault();
        }
    }

    return (
        <div>
            <form
                action={deleteAction}
                onSubmit={handleDeleteSubmit}
            >
                <input
                    type="hidden"
                    name="product_id"
                    value={productId}
                />

                <button
                    type="submit"
                    disabled={deletePending}
                    aria-label={`Excluir ${productTitle}`}
                    title="Excluir"
                    className="inline-flex size-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FiTrash2 size={18} />
                </button>

                <Link
                    href={`/admin/products/${productId}/edit`}
                    aria-label={`Editar ${productTitle}`}
                    title="Editar"
                    className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                    <FiEdit2 size={18} />
                </Link>
            </form>

            {deleteState.message &&
                !deleteState.success && (
                    <p
                        className="mt-2 max-w-60 text-xs leading-relaxed text-red-600"
                        role="alert"
                    >
                        {deleteState.message}
                    </p>
                )}
        </div>
    );
}