'use client';

import Image from "next/image";
import MiniCart from "../Minicart";
import logo from '@/public/logo.jpg';
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Logo from "../Logo/Logo";

export default function Header() {
    const { products: cartProducts } = useCartStore();

    const isHomepage =
        typeof window !== 'undefined' &&
        window.location.pathname === '/';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/80 backdrop-blur-md transition-all">
            {/* Linha superior minimalista */}
            <div className="hidden md:block border-b border-brand-border bg-brand-bg">
                <div className="mx-auto flex h-9 w-full max-w-480 items-center justify-between px-6 text-[11px] font-medium tracking-wide text-brand-muted lg:px-10">
                    <p className="uppercase tracking-[0.15em]">
                        Entrega rápida • Compra segura
                    </p>

                    <div className="flex items-center gap-6">
                        <span>Descontos de até 50% • Aproveite agora</span>
                        <span className="font-semibold text-brand-dark">Frete Expresso</span>
                    </div>
                </div>
            </div>

            {/* Header principal */}
            <div className="mx-auto flex w-full max-w-480 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
                <Logo />

                {/* DIREITA - Ações e Carrinho */}
                <div className="flex items-center gap-4">
                    {/* Badge simplificado combinando com a nova identidade */}
                    <div className="hidden lg:flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold tracking-wider text-brand-dark uppercase">
                            Ofertas Ativas
                        </span>
                    </div>

                    {/* Carrinho */}
                    {isHomepage && (
                        <div className="relative">
                            <MiniCart />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}