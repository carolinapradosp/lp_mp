"use client";

import { ProductsProps } from "@/interfaces/Product";
import { useCartStore } from "@/store/cartStore";
import getUnitPrice from "@/utils/cart";
import { formatCurrency } from "@/utils/utils";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

export default function MiniCart({ products }: ProductsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimate, setIsAnimate] = useState(false);

    const { remove, increase, decrease } = useCartStore();

    const totalItems = useMemo(() => {
        return products.reduce((acc, item) => acc + item.quantity, 0);
    }, [products]);

    const totalPrice = useMemo(() => {
        return products.reduce((acc, item) => {
            const unitPrice = getUnitPrice(item.price, item.quantity);
            return acc + item.quantity * unitPrice;
        }, 0);
    }, [products]);

    useEffect(() => {
        if (totalItems === 0) return;

        setIsAnimate(true);

        const timer = setTimeout(() => {
            setIsAnimate(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [totalItems]);

    return (
        <>
            {/* BOTÃO */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative flex h-13 w-13 cursor-pointer items-center justify-center rounded-2xl border border-blue-100 bg-white text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
            >
                <ShoppingCart size={22} />

                {totalItems > 0 && (
                    <span
                        className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-blue-500 px-1 text-[10px] font-semibold text-white transition-all duration-300 ${isAnimate ? "scale-115" : "scale-100"
                            }`}
                    >
                        {totalItems}
                    </span>
                )}
            </button>

            {/* OVERLAY */}
            <div
                className={`fixed inset-0 z-999 transition-all duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
            >
                {/* BACKDROP */}
                <div
                    onClick={() => setIsOpen(false)}
                    className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                />

                {/* SIDEBAR */}
                <aside
                    className={`absolute right-0 top-0 flex h-screen w-full max-w-115 flex-col overflow-hidden border-l border-blue-100 bg-[#F8FAFC] shadow-[-10px_0_40px_rgba(15,23,42,0.15)] transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {/* HEADER */}
                    <div className="border-b border-blue-100 bg-white px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-[2rem] leading-none font-bold tracking-tight text-slate-900">
                                    Meu Carrinho
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    {totalItems} {totalItems > 1 ? "itens" : "item"}
                                </p>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-slate-50 text-slate-500 transition-all hover:border-blue-200 hover:bg-white hover:text-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* LISTA */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {products.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                                    <ShoppingCart size={42} className="text-blue-500" />
                                </div>

                                <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                                    Carrinho vazio
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    Adicione produtos para continuar sua compra
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {products.map((product) => {
                                    const quantity = product.quantity;

                                    const unitPrice = getUnitPrice(
                                        product.price,
                                        quantity
                                    );

                                    const total = quantity * unitPrice;

                                    const hasDiscount =
                                        unitPrice < product.base_price;

                                    return (
                                        <div
                                            key={product.id}
                                            className="group rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all hover:shadow-[0_8px_30px_rgba(37,99,235,0.10)]"
                                        >
                                            <div className="flex gap-4">
                                                {/* IMAGEM */}
                                                <div className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-50 to-blue-50">
                                                    {product.image_url && (
                                                        <Image
                                                            src={product.image_url}
                                                            alt={product.title}
                                                            width={74}
                                                            height={74}
                                                            className="h-auto w-auto object-contain"
                                                        />
                                                    )}
                                                </div>

                                                {/* CONTEÚDO */}
                                                <div className="min-w-0 flex-1">
                                                    {/* TOPO */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-lg font-semibold text-slate-900">
                                                                {product.title}
                                                            </h3>

                                                            <div className="mt-2 flex items-end gap-2">
                                                                {hasDiscount && (
                                                                    <span className="text-xs font-medium text-slate-400 line-through">
                                                                        {formatCurrency(product.base_price || 0)}
                                                                    </span>
                                                                )}

                                                                <span className="text-[1.5rem] leading-none font-bold tracking-tight text-slate-900">
                                                                    {formatCurrency(unitPrice || 0)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => remove(product.id)}
                                                            className="flex cursor-pointer h-10 w-10 shrink-0 items-center justify-center text-black transition-all hover:text-black-500"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>

                                                    {/* MOBILE */}
                                                    <div className="mt-5 flex flex-col gap-4 sm:hidden">
                                                        <div className="flex h-11 w-fit items-center overflow-hidden rounded-xl border border-blue-100 bg-slate-50">
                                                            <button
                                                                onClick={() => decrease(product.id)}
                                                                className="flex cursor-pointer h-full w-11 shrink-0 items-center justify-center text-slate-500 transition-all hover:bg-white hover:text-slate-900"
                                                            >
                                                                <Minus size={16} />
                                                            </button>

                                                            <div className="flex h-full min-w-11 items-center justify-center border-x border-blue-100 px-3 text-sm font-semibold text-slate-900">
                                                                {quantity}
                                                            </div>

                                                            <button
                                                                onClick={() => increase(product.id)}
                                                                className="flex cursor-pointerS h-full w-11 shrink-0 items-center justify-center text-slate-500 transition-all hover:bg-white hover:text-slate-900"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>

                                                        <div>
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                                Total
                                                            </p>

                                                            <strong className="text-[2rem] leading-none font-bold tracking-tight text-blue-600">
                                                                {formatCurrency(Number(total || 0))}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    {/* DESKTOP */}
                                                    <div className="mt-5 hidden items-center justify-between gap-4 sm:flex">
                                                        <div className="flex h-11 items-center overflow-hidden rounded-xl border border-blue-100 bg-slate-50">
                                                            <button
                                                                onClick={() => decrease(product.id)}
                                                                className="flex h-full w-11 items-center justify-center text-slate-500 transition-all hover:bg-white hover:text-slate-900"
                                                            >
                                                                <Minus size={16} />
                                                            </button>

                                                            <div className="flex h-full min-w-11 items-center justify-center border-x border-blue-100 px-3 text-sm font-semibold text-slate-900">
                                                                {quantity}
                                                            </div>

                                                            <button
                                                                onClick={() => increase(product.id)}
                                                                className="flex h-full w-11 items-center justify-center text-slate-500 transition-all hover:bg-white hover:text-slate-900"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                                Total
                                                            </p>

                                                            <strong className="text-2xl font-bold tracking-tight text-blue-600">
                                                                {formatCurrency(Number(total || 0))}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    {products.length > 0 && (
                        <div className="border-t border-blue-100 bg-white p-5">
                            <div className="mb-5 flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Subtotal
                                    </p>

                                    <strong className="mt-1 block text-4xl leading-none font-bold tracking-tight text-slate-900">
                                        {formatCurrency(Number(totalPrice || 0))}
                                    </strong>
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    (window.location.href = "/checkout")
                                }
                                className="w-full cursor-pointer rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(59,130,246,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(59,130,246,0.40)]"
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    )}
                </aside>
            </div>
        </>
    );
}