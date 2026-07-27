"use client";

import { useCartStore } from "@/store/cartStore";
import getUnitPrice from "@/utils/cart";
import { formatCurrency } from "@/utils/utils";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

export default function MiniCart() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimate, setIsAnimate] = useState(false);

    const products = useCartStore((state) => state.products);
    const remove = useCartStore((state) => state.remove);
    const increase = useCartStore((state) => state.increase);
    const decrease = useCartStore((state) => state.decrease);

    const totalItems = useMemo(() => {
        return products.reduce((acc, item) => acc + item.quantity, 0);
    }, [products]);

    const totalPrice = useMemo(() => {
        return products.reduce((total, item) => {
            return total + item.quantity * item.price;
        }, 0);
    }, [products]);

    useEffect(() => {
        if (totalItems === 0) return;

        setIsAnimate(true);
        const timer = setTimeout(() => setIsAnimate(false), 300);
        return () => clearTimeout(timer);
    }, [totalItems]);

    return (
        <>
            {/* BOTÃO DO CARRINHO (HEADER) */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark transition-all duration-200 hover:bg-brand-bg"
            >
                <ShoppingCart size={18} />

                {totalItems > 0 && (
                    <span
                        className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-dark px-1 text-[9px] font-bold text-white transition-all duration-300 ${isAnimate ? "scale-120" : "scale-100"
                            }`}
                    >
                        {totalItems}
                    </span>
                )}
            </button>

            {/* OVERLAY GLOBAL */}
            <div
                className={`fixed inset-0 z-60 h-screen transition-all duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
            >
                {/* BACKDROP PRETO FOSCO */}
                <div
                    onClick={() => setIsOpen(false)}
                    className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
                />

                {/* SIDEBAR DO CARRINHO */}
                <aside
                    className={`absolute right-0 top-0 flex h-screen w-full max-w-md flex-col overflow-hidden bg-[#fdfbf7] shadow-xl transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {/* CABEÇALHO DA SIDEBAR */}
                    <div className="border-b border-brand-border bg-white px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold tracking-tight text-brand-dark">
                                    Cart
                                </h2>
                                <span className="text-xs text-brand-muted font-normal">
                                    ({totalItems} {totalItems > 1 ? "items" : "item"})
                                </span>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-brand-muted hover:bg-brand-bg hover:text-brand-dark transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* LISTA DE PRODUTOS */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {products.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <ShoppingCart size={32} className="text-brand-muted mb-3" />
                                <h3 className="text-base font-medium text-brand-dark">
                                    Seu carrinho está vazio
                                </h3>
                                <p className="mt-1 text-xs text-brand-muted max-w-[200px]">
                                    Navegue pela loja e adicione itens para começar.
                                </p>
                            </div>
                        ) : (
                            products.map((product) => {
                                const quantity = product.quantity;
                                const unitPrice = product.price;
                                const total = quantity * unitPrice;
                                const hasDiscount = unitPrice < product.base_price;

                                return (
                                    <div
                                        key={product.id}
                                        className="flex gap-4 border-b border-brand-border/60 pb-4 last:border-0"
                                    >
                                        {/* CONTAINER DA IMAGEM (IGUAL AOS CARDS DO APP) */}
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white border border-brand-border">
                                            {product.image_url && (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    width={64}
                                                    height={64}
                                                    className="h-auto w-auto object-contain max-h-[80%]"
                                                />
                                            )}
                                        </div>

                                        {/* INFORMAÇÕES DO PRODUTO */}
                                        <div className="flex flex-1 flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="truncate text-sm font-medium text-brand-dark">
                                                        {product.title}
                                                    </h3>
                                                    <button
                                                        onClick={() => remove(product.id)}
                                                        className="text-brand-muted hover:text-red-500 transition-colors p-0.5"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {/* PREÇOS UNITÁRIOS */}
                                                <div className="mt-1 flex items-center gap-1.5 text-xs">
                                                    {hasDiscount && (
                                                        <span className="text-brand-muted line-through">
                                                            {formatCurrency(product.base_price || 0)}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-brand-dark">
                                                        {formatCurrency(unitPrice || 0)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* SELETOR DE QUANTIDADE E TOTAL (ESTILO SOFA APP) */}
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex h-8 items-center overflow-hidden rounded-lg border border-brand-border bg-white">
                                                    <button
                                                        onClick={() => decrease(product.id)}
                                                        className="flex h-full w-8 items-center justify-center text-brand-muted hover:bg-brand-bg hover:text-brand-dark transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="flex h-full min-w-8 items-center justify-center px-2 text-xs font-medium text-brand-dark border-x border-brand-border">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => increase(product.id)}
                                                        className="flex h-full w-8 items-center justify-center text-brand-muted hover:bg-brand-bg hover:text-brand-dark transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                <span className="text-sm font-semibold text-brand-dark">
                                                    {formatCurrency(Number(total || 0))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* RODAPÉ DO CARRINHO */}
                    {products.length > 0 && (
                        <div className="border-t border-brand-border bg-white px-6 py-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-brand-muted font-medium">Total</span>
                                <span className="text-xl font-bold tracking-tight text-brand-dark">
                                    {formatCurrency(Number(totalPrice || 0))}
                                </span>
                            </div>

                            <button
                                onClick={() => (window.location.href = "/checkout")}
                                className="w-full rounded-xl bg-brand-dark py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-200 hover:bg-brand-dark/90 active:scale-[0.99]"
                            >
                                Checkout
                            </button>
                        </div>
                    )}
                </aside>
            </div>
        </>
    );
}