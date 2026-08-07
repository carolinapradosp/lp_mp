'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBox, FiClipboard } from 'react-icons/fi';

export default function HeaderAdmin() {
    const pathname = usePathname();

    const dashboardActive = pathname.startsWith('/admin/dashboard');
    const productsActive = pathname.startsWith('/admin/products');

    return (
        <header className="mb-8 rounded-xl border border-slate-200 bg-white shadow-md">
            <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                        <span className="text-red-500">
                            LP
                        </span>

                        <span className="text-blue-500">
                            MP
                        </span>
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Painel Administrativo
                    </p>
                </div>

                <nav className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:gap-3">
                    <Link
                        href="/admin/dashboard"
                        className={`
                            inline-flex
                            min-h-11
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            transition
                            md:w-auto
                            ${dashboardActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }
                        `}
                    >
                        <FiClipboard size={18} />

                        Pedidos
                    </Link>

                    <Link
                        href="/admin/products"
                        className={`
                            inline-flex
                            min-h-11
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            transition
                            md:w-auto
                            ${productsActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }
                        `}
                    >
                        <FiBox size={18} />

                        Produtos
                    </Link>
                </nav>
            </div>
        </header>
    );
}