// components/Minicart/index.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
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
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const dialogRef = useRef<HTMLElement>(null);
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

        const body = document.body;
        const root = document.documentElement;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const scrollbarWidth = window.innerWidth - root.clientWidth;
        const bodyPadding = window.getComputedStyle(body).paddingRight;
        const bodyProperties = [
            "overflow", "position", "top", "left", "width", "padding-right",
        ];
        const previousBodyStyles = bodyProperties.map((property) => ({
            property,
            value: body.style.getPropertyValue(property),
            priority: body.style.getPropertyPriority(property),
        }));
        const previousRootOverflow = root.style.getPropertyValue("overflow");
        const previousRootOverflowPriority = root.style.getPropertyPriority("overflow");

        root.style.setProperty("overflow", "hidden");
        body.style.setProperty("overflow", "hidden");
        body.style.setProperty("position", "fixed");
        body.style.setProperty("top", `-${scrollY}px`);
        body.style.setProperty("left", `-${scrollX}px`);
        body.style.setProperty("width", "100%");
        if (scrollbarWidth > 0) {
            body.style.setProperty(
                "padding-right",
                `${parseFloat(bodyPadding) + scrollbarWidth}px`,
            );
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                setIsOpen(false);
            }

            if (event.key === "Tab") {
                const elements = dialogRef.current?.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), [tabindex="0"]',
                );
                const first = elements?.[0];
                const last = elements?.[elements.length - 1];
                if (!first || !last) return;

                const outside = !dialogRef.current?.contains(document.activeElement);
                if (event.shiftKey && (document.activeElement === first || outside)) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && (document.activeElement === last || outside)) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        const focusFrame = window.requestAnimationFrame(() => {
            closeButtonRef.current?.focus({ preventScroll: true });
        });

        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener("keydown", handleKeyDown);

            // Restaura a posição sem animação, mesmo com scroll suave no site.
            const scrollBehavior = root.style.getPropertyValue("scroll-behavior");
            const scrollPriority = root.style.getPropertyPriority("scroll-behavior");
            root.style.setProperty("scroll-behavior", "auto", "important");
            for (const { property, value, priority } of previousBodyStyles) {
                if (value) body.style.setProperty(property, value, priority);
                else body.style.removeProperty(property);
            }
            if (previousRootOverflow) {
                root.style.setProperty("overflow", previousRootOverflow, previousRootOverflowPriority);
            } else {
                root.style.removeProperty("overflow");
            }
            window.scrollTo(scrollX, scrollY);
            if (scrollBehavior) {
                root.style.setProperty("scroll-behavior", scrollBehavior, scrollPriority);
            } else {
                root.style.removeProperty("scroll-behavior");
            }
            triggerButtonRef.current?.focus({ preventScroll: true });
        };
    }, [isOpen]);

    function openMiniCart() {
        setPortalTarget(document.body);
        setIsOpen(true);
    }

    function closeMiniCart() {
        setIsOpen(false);
    }

    return (
        <>
            <button
                ref={triggerButtonRef}
                type="button"
                onClick={openMiniCart}
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

            {portalTarget && createPortal(
                <div
                    className={`
          fixed inset-0 z-[1000] h-dvh overflow-hidden overscroll-none
          transition-all duration-300
          ${isOpen
                            ? "visible opacity-100"
                            : "invisible opacity-0"
                        }
        `}
                    inert={!isOpen}
                    aria-hidden={!isOpen}
                >
                    <button
                        type="button"
                        onClick={closeMiniCart}
                        aria-label="Fechar carrinho"
                        tabIndex={-1}
                        className="
            absolute inset-0
            h-full w-full
            cursor-default touch-none
            bg-black/20
            backdrop-blur-[1px]
          "
                    />

                    <aside
                        ref={dialogRef}
                        id="mini-cart"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mini-cart-title"
                        className={`
            absolute right-0 top-0
            flex h-full w-full max-w-md
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
                        <header className="shrink-0 border-b border-brand-border bg-white px-6 py-5">
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

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
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
                        relative flex h-20 w-20 shrink-0
                        items-center justify-center
                        overflow-hidden
                        border border-brand-border
                        
                      ${product.image_url ? "bg-white" : "bg-gray-100"}
                      `}
                                            >
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.title}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
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
                            <footer className="shrink-0 space-y-4 border-t border-brand-border bg-white px-6 py-6">
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
                </div>,
                portalTarget,
            )}
        </>
    );
}