// components/AdminComponents/Products/ProductsTable.tsx

import Image from 'next/image';
import Link from 'next/link';

import { toggleProductStatus } from '@/app/admin/(protected)/products/actions';

import type { AdminProduct } from '@/interfaces/Product';

type ProductsTableProps = {
    products: AdminProduct[];
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export default function ProductsTable({
    products,
}: ProductsTableProps) {
    if (products.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="font-semibold text-slate-900">
                    Nenhum produto cadastrado
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Cadastre o primeiro produto para começar.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                                Produto
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                                Preço base
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                                Estoque
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                                Regras
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                                Status
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                            {product.image_url ? (
                                                <Image
                                                    src={
                                                        product.image_url
                                                    }
                                                    alt={
                                                        product.title
                                                    }
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-center text-[10px] text-slate-400">
                                                    Sem imagem
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {product.title}
                                            </p>

                                            <p className="line-clamp-1 max-w-70 text-sm text-slate-500">
                                                {product.description ||
                                                    'Sem descrição'}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                    {formatCurrency(
                                        product.base_price,
                                    )}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {product.stock}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {product.pricing_rules.length}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {product.active
                                            ? 'Ativo'
                                            : 'Inativo'}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                                        >
                                            Editar
                                        </Link>

                                        <form
                                            action={
                                                toggleProductStatus
                                            }
                                        >
                                            <input
                                                type="hidden"
                                                name="product_id"
                                                value={product.id}
                                            />

                                            <input
                                                type="hidden"
                                                name="current_status"
                                                value={String(
                                                    product.active,
                                                )}
                                            />

                                            <button
                                                type="submit"
                                                className={`text-sm font-semibold transition ${product.active
                                                        ? 'text-red-600 hover:text-red-800'
                                                        : 'text-emerald-600 hover:text-emerald-800'
                                                    }`}
                                            >
                                                {product.active
                                                    ? 'Desativar'
                                                    : 'Ativar'}
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}