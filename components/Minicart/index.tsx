// components/Minicart/index.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
    X,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/utils";

export default function MiniCart() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimate, setIsAnimate] = useState(false);

    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement>(null);

    const products = useCartStore((state) => state.products);
    const remove = useCartStore((state) => state.remove);
    const increase = useCartStore((state) => state.increase);
    const decrease = useCartStore((state) => state.decrease);

    const totalItems = useMemo(() => {
        return products.reduce(
            (total, item) => total + item.quantity,
            0,
        );
    }, [products]);

    const totalPrice = useMemo(() => {
        return products.reduce(
            (total, item) =>
                total + item.quantity * item.price,
            0,
        );
    }, [products]);

    useEffect(() => {
        if (totalItems === 0) {
            return;
        }

        setIsAnimate(true);

        const timer = window.setTimeout(() => {
            setIsAnimate(false);
        }, 300);

        return () => {
            window.clearTimeout(timer);
        };
    }, [totalItems]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        window.requestAnimationFrame(() => {
            closeButtonRef.current?.focus();
        });

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            document.body.style.overflow = previousOverflow;
            triggerButtonRef.current?.focus();
        };
    }, [isOpen]);

    function closeMiniCart() {
        setIsOpen(false);
    }

    return (
        <>
            <button
                ref={triggerButtonRef}
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={`Abrir carrinho com ${totalItems} ${totalItems === 1 ? "item" : "itens"
                    }`}
                aria-expanded={isOpen}
                aria-controls="mini-cart"
                className="
          relative
          flex h-11 w-11
          cursor-pointer
          items-center justify-center
          rounded-full
          border border-brand-border
          bg-white
          text-brand-dark
          transition-all duration-200
          hover:bg-brand-bg
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-brand-dark
        "
            >
                <ShoppingCart
                    aria-hidden="true"
                    size={18}
                />

                {totalItems > 0 && (
                    <span
                        aria-hidden="true"
                        className={`
              absolute -right-1 -top-1
              flex h-4 min-w-4
              items-center justify-center
              rounded-full
              bg-brand-dark
              px-1
              text-[9px] font-bold text-white
              transition-transform duration-300
              ${isAnimate
                                ? "scale-120"
                                : "scale-100"
                            }
            `}
                    >
                        {totalItems}
                    </span>
                )}
            </button>

            <div
                className={`
          fixed inset-0 z-60 h-screen
          transition-all duration-300
          ${isOpen
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                    }
        `}
                aria-hidden={!isOpen}
            >
                <button
                    type="button"
                    onClick={closeMiniCart}
                    aria-label="Fechar carrinho"
                    tabIndex={isOpen ? 0 : -1}
                    className="
            absolute inset-0
            h-full w-full
            cursor-default
            bg-black/20
            backdrop-blur-[1px]
          "
                />

                <aside
                    id="mini-cart"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mini-cart-title"
                    className={`
            absolute right-0 top-0
            flex h-screen w-full max-w-md
            flex-col overflow-hidden
            bg-[#fdfbf7]
            shadow-xl
            transition-transform duration-300
            ${isOpen
                            ? "translate-x-0"
                            : "translate-x-full"
                        }
          `}
                >
                    <header className="border-b border-brand-border bg-white px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2
                                    id="mini-cart-title"
                                    className="text-xl font-semibold tracking-tight text-brand-dark"
                                >
                                    Carrinho
                                </h2>

                                <span
                                    aria-live="polite"
                                    className="text-xs font-normal text-brand-muted"
                                >
                                    ({totalItems}{" "}
                                    {totalItems === 1 ? "item" : "itens"})
                                </span>
                            </div>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={closeMiniCart}
                                aria-label="Fechar carrinho"
                                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-full
                  text-brand-muted
                  transition-all
                  hover:bg-brand-bg
                  hover:text-brand-dark
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-brand-dark
                "
                            >
                                <X
                                    aria-hidden="true"
                                    size={18}
                                />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                        {products.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <ShoppingCart
                                    aria-hidden="true"
                                    size={32}
                                    className="mb-3 text-brand-muted"
                                />

                                <h3 className="text-base font-medium text-brand-dark">
                                    Seu carrinho está vazio
                                </h3>

                                <p className="mt-1 max-w-50 text-xs text-brand-muted">
                                    Navegue pela loja e adicione itens
                                    para começar.
                                </p>
                            </div>
                        ) : (
                            products.map((product) => {
                                const quantity = product.quantity;
                                const unitPrice = product.price;
                                const total = quantity * unitPrice;

                                const hasDiscount =
                                    unitPrice < product.base_price;

                                const reachedStockLimit =
                                    typeof product.stock === "number" &&
                                    quantity >= product.stock;

                                return (
                                    <article
                                        key={product.id}
                                        className="
                      flex gap-4
                      border-b border-brand-border/60
                      pb-4
                      last:border-0
                    "
                                    >
                                        <div
                                            className={`
                        flex h-20 w-20 shrink-0
                        items-center justify-center
                        overflow-hidden
                        rounded-xl
                        border border-brand-border
                        
                      ${product.image_url ? "bg-white" : "bg-gray-200"}
                      `}
                                        >
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    width={64}
                                                    height={64}
                                                    className="
                            h-auto w-auto
                            max-h-[80%]
                            object-contain
                          "
                                                />
                                            ) : <div className="text-xs text-center">Sem Imagem</div>}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="truncate text-sm font-medium text-brand-dark">
                                                        {product.title}
                                                    </h3>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            remove(product.id)
                                                        }
                                                        aria-label={`Remover ${product.title} do carrinho`}
                                                        className="
                              p-0.5
                              text-brand-muted
                              transition-colors
                              hover:text-red-500
                              focus-visible:outline-2
                              focus-visible:outline-offset-2
                              focus-visible:outline-red-500
                            "
                                                    >
                                                        <Trash2
                                                            aria-hidden="true"
                                                            size={14}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="mt-1 flex items-center gap-1.5 text-xs">
                                                    {hasDiscount && (
                                                        <span className="text-brand-muted line-through">
                                                            {formatCurrency(
                                                                product.base_price,
                                                            )}
                                                        </span>
                                                    )}

                                                    <span className="font-semibold text-brand-dark">
                                                        {formatCurrency(unitPrice)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div
                                                    className="
                            flex h-8 items-center
                            overflow-hidden
                            rounded-xl
                            border border-brand-border
                            bg-white
                          "
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            decrease(product.id)
                                                        }
                                                        aria-label={`Diminuir quantidade de ${product.title}`}
                                                        className="
                              flex h-full w-8
                              items-center justify-center
                              text-brand-muted
                              transition-colors
                              hover:bg-brand-bg
                              hover:text-brand-dark
                              focus-visible:outline-2
                              focus-visible:outline-offset-[-2px]
                              focus-visible:outline-brand-dark
                            "
                                                    >
                                                        <Minus
                                                            aria-hidden="true"
                                                            size={12}
                                                        />
                                                    </button>

                                                    <span
                                                        aria-label={`Quantidade de ${product.title}: ${quantity}`}
                                                        className="
                              flex h-full min-w-8
                              items-center justify-center
                              border-x border-brand-border
                              px-2
                              text-xs font-medium
                              text-brand-dark
                            "
                                                    >
                                                        {quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={reachedStockLimit}
                                                        onClick={() =>
                                                            increase(product.id)
                                                        }
                                                        aria-label={`Aumentar quantidade de ${product.title}`}
                                                        className="
                              flex h-full w-8
                              items-center justify-center
                              text-brand-muted
                              transition-colors
                              hover:bg-brand-bg
                              hover:text-brand-dark
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                              focus-visible:outline-2
                              focus-visible:outline-offset-[-2px]
                              focus-visible:outline-brand-dark
                            "
                                                    >
                                                        <Plus
                                                            aria-hidden="true"
                                                            size={12}
                                                        />
                                                    </button>
                                                </div>

                                                <span className="text-sm font-semibold text-brand-dark">
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>

                                            {reachedStockLimit && (
                                                <p className="mt-2 text-[11px] text-brand-muted">
                                                    Limite disponível em estoque
                                                    atingido.
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>

                    {products.length > 0 && (
                        <footer className="space-y-4 border-t border-brand-border bg-white px-6 py-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-brand-muted">
                                    Total
                                </span>

                                <span className="text-xl font-bold tracking-tight text-brand-dark">
                                    {formatCurrency(totalPrice)}
                                </span>
                            </div>

                            <Link
                                href="/checkout"
                                onClick={closeMiniCart}
                                className="
                  block w-full
                  rounded-xl
                  bg-brand-dark
                  py-3.5
                  text-center
                  text-xs font-semibold
                  uppercase tracking-widest
                  text-white
                  transition-all duration-200
                  hover:bg-brand-dark/90
                  active:scale-[0.99]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-brand-dark
                "
                            >
                                Checkout
                            </Link>
                        </footer>
                    )}
                </aside>
            </div>
        </>
    );
}