// app/admin/(protected)/products/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';

import HeaderAdmin from '@/components/AdminComponents/HeaderAdmin';
import ProductsTable from '@/components/AdminComponents/Products/ProductsTable';
import { verifyAdminSession } from '@/lib/auth/admin-session';
import { getAdminProductsFromDatabase } from '@/lib/products/queries';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
        redirect('/admin');
    }

    const products = await getAdminProductsFromDatabase();

    return (
        <main className="min-h-screen bg-[#f5f7fb] p-4 lg:p-8">
            <div className="mx-auto max-w-480">
                <HeaderAdmin />

                <section className="mt-8 p-8 rounded-xl border border-slate-200 bg-white shadow-md">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Produtos
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Cadastre e gerencie os produtos
                                exibidos na loja.
                            </p>
                        </div>

                        <Link
                            href="/admin/products/new"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Novo produto
                        </Link>
                    </div>

                    <ProductsTable products={products} />
                </section>
            </div>
        </main>
    );
}