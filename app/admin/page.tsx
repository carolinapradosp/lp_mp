'use client';

import { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    async function handleLogin(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            const response = await fetch(
                '/api/admin/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            window.location.href =
                '/admin/dashboard';
        } catch (error) {
            console.error(error);

            alert(
                'Erro ao realizar login'
            );
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-100 via-white to-blue-50 px-4 py-10">

            {/* BG */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
            </div>

            {/* CARD */}
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-4xl border border-white/60 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">

                {/* TOPO */}
                <div className="relative overflow-hidden border-b border-slate-100 bg-linear-to-r from-blue-600 via-indigo-500 to-red-500 px-8 py-10">

                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md">
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

                {/* FORM */}
                <div className="p-8">
                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        {/* USUÁRIO */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Usuário
                            </label>

                            <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]">
                                <User
                                    size={19}
                                    className="text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Digite seu usuário"
                                    className="h-full w-full border-none bg-transparent px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* SENHA */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Senha
                            </label>

                            <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]">
                                <Lock
                                    size={19}
                                    className="text-slate-400"
                                />

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Digite sua senha"
                                    className="h-full w-full border-none bg-transparent px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* BOTÃO */}
                        <button
                            type="submit"
                            className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-indigo-500 to-red-500 text-[15px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_35px_rgba(59,130,246,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(59,130,246,0.38)]"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}