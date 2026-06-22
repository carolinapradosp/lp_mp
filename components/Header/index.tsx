'use client';

import Image from "next/image";
import MiniCart from "../Minicart";
import logo from '@/public/logo.png';
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

export default function Header() {
    const {
        products: cartProducts,
    } = useCartStore();

    const isHomepage =
        typeof window !== 'undefined' &&
        window.location.pathname === '/';

    return (
        <header
            className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-blue-100
        bg-white/90
        transition-all
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
      "
        >
            {/* Linha superior */}
            <div
                className="
          hidden
          md:block
          border-b
          border-blue-100
          bg-linear-to-r
          from-blue-600
          via-blue-500
          to-red-500
        "
            >
                <div className="mx-auto flex h-10 w-full max-w-480 items-center justify-between px-6 lg:px-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                        Entrega rápida • Compra segura
                    </p>

                    <div className="flex items-center gap-6 text-xs font-medium text-white/90">
                        <span>Saúde • Bem-estar • Conveniência</span>
                        <span>Frete Expresso</span>
                    </div>
                </div>
            </div>

            {/* Header principal */}
            <div className="relative overflow-hidden">
                {/* Glow decorativo */}
                <div
                    className="
            pointer-events-none
            absolute
            -left-20
            top-1/2
            h-48
            w-48
            -translate-y-1/2
            rounded-full
            bg-blue-500/10
            blur-3xl
          "
                />

                <div
                    className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-40
            w-40
            rounded-full
            bg-red-500/10
            blur-3xl
          "
                />

                <div
                    className="
            relative
            mx-auto
            flex
            w-full
            max-w-480
            items-center
            justify-between
            gap-4
            px-4
            py-4
            sm:px-6
            lg:px-10
          "
                >
                    {/* LOGO */}
                    <Link
                        href="/"
                        className="
              group
              flex
              items-center
              gap-4
            "
                    >


                        <Image src={logo} alt="Express Pharma" width={220} />


                        <p
                            className="
                    mt-1
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-slate-500
                  "
                        >

                        </p>
                    </Link>

                    {/* DIREITA */}
                    <div className="flex items-center gap-3">
                        {/* Badge desktop */}
                        <div
                            className="
                hidden
                lg:flex
                items-center
                gap-3
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
              "
                        >
                            <div
                                className="
                  h-3
                  w-3
                  rounded-full
                  bg-red-500
                  animate-pulse
                "
                            />

                            <div>
                                <p className="text-xs font-bold text-red-600">
                                    OFERTAS ATIVAS
                                </p>

                                <p className="text-xs text-slate-500">
                                    Aproveite descontos exclusivos
                                </p>
                            </div>
                        </div>

                        {/* Carrinho */}
                        {isHomepage && (
                            <MiniCart
                                products={cartProducts}
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}