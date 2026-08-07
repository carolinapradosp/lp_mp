//app/admin/page.tsx

import AdminLoginForm from '@/components/AdminComponents/AdminLoginForm';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-100 via-white to-blue-50 px-4 py-10">

            {/* BG */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
            </div>

            {/* CARD */}
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/60 bg-white/90 shadow-md backdrop-blur-xl">

                {/* TOPO */}
                <div className="relative overflow-hidden border-b border-slate-100 bg-linear-to-r from-blue-600 via-indigo-500 to-red-500 px-8 py-10">

                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
                            <ShieldCheck
                                size={36}
                                className="text-white"
                            />
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-white">
                            LP{" "}
                            <span className="text-blue-100">
                                MP
                            </span>
                        </h1>

                        <p className="mt-3 text-sm font-medium text-white/80">
                            Painel Administrativo
                        </p>
                    </div>
                </div>

                <AdminLoginForm />
            </div>
        </main>
    );
}