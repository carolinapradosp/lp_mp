import Link from "next/link";

export default function HeaderAdmin() {
    return (
        <header className="mb-10">
            <h1 className="text-4xl font-black">
                <span className="text-red-500">
                    LP
                </span>

                <span className="text-blue-500">
                    MP
                </span>
            </h1>

            <p className="text-zinc-400 mt-2">
                Painel Administrativo
            </p>


            <nav className="flex items-center gap-4">
                <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-slate-700 hover:text-slate-950"
                >
                    Pedidos
                </Link>

                <Link
                    href="/admin/products"
                    className="text-sm font-medium text-slate-700 hover:text-slate-950"
                >
                    Produtos
                </Link>
            </nav>
        </header>
    )
}