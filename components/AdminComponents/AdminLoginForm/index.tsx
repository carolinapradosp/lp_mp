//components/AdminComponents/AdminLoginForm/index.tsx
"use client";

import { Lock, User } from "lucide-react";
import { useState } from "react";

export default function AdminLoginForm() {
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
                    credentials: 'same-origin',
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

                    <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md">
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

                    <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md">
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
                    className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-linear-to-r from-blue-600 via-indigo-500 to-red-500 text-[15px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_35px_rgba(59,130,246,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(59,130,246,0.38)]"
                >
                    Entrar
                </button>
            </form>
        </div>
    )
}