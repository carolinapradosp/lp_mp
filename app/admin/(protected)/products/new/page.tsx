// app/admin/(protected)/products/new/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';

import HeaderAdmin from '@/components/AdminComponents/HeaderAdmin';
import ProductForm from '@/components/AdminComponents/Products/ProductForm';
import { verifyAdminSession } from '@/lib/auth/admin-session';

export default async function NewProductPage() {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
        redirect('/admin');
    }

    return (
        <main className="min-h-screen bg-[#f5f7fb] p-4 lg:p-8">
            <div className="mx-auto max-w-480">
                <HeaderAdmin />

                <section className="mx-auto mt-8 max-w-4xl">
                    <Link
                        href="/admin/products"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        ← Voltar para produtos
                    </Link>

                    <div className="mb-6 mt-4">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Novo produto
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Preencha as informações do produto e
                            suas regras de preço.
                        </p>
                    </div>

                    <ProductForm />
                </section>
            </div>
        </main>
    );
}