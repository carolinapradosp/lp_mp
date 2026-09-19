// components/ResumoPedido/index.tsx

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/utils";
import Image from "next/image";

export default function ResumoPedido() {
    const { products } = useCartStore();

    return (
        <div className="w-full">
            {/* HEADER INTERNO */}
            <div className="mb-6 flex items-center justify-between border-b border-brand-border pb-4">
                <h2 className="text-xl font-medium tracking-tight text-[var(--color-brand-dark)]">
                    Seu pedido
                </h2>

                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-muted)]">
                    {products.length} {products.length > 1 ? "itens" : "item"}
                </span>
            </div>

            {/* LISTA DE PRODUTOS */}
            <div className="divide-y divide-[var(--color-brand-border)]">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group flex flex-row items-center gap-4 py-4 bg-transparent transition-colors duration-200"
                    >
                        {/* IMAGEM */}
                        <div
                            className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-brand-border transition-colors duration-300 group-hover:border-[var(--color-brand-dark)] ${product.image_url ? "bg-white" : "bg-gray-100"
                                }`}
                        >
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.title}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="text-xs text-center">
                                    Sem Imagem
                                </div>
                            )}
                        </div>

                        {/* INFO DO PRODUTO (Título e Qtd) */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium leading-tight tracking-tight text-[var(--color-brand-dark)] truncate">
                                {product.title}
                            </h3>

                            <p className="mt-1 text-xs text-[var(--color-brand-muted)]">
                                Qtd:{" "}
                                <span className="font-medium text-[var(--color-brand-dark)]">
                                    {product.quantity}
                                </span>
                            </p>
                        </div>

                        {/* PREÇO TOTAL DO ITEM */}
                        <div className="text-right whitespace-nowrap">
                            <strong className="text-sm font-semibold text-[var(--color-brand-dark)]">
                                {formatCurrency(product.price * product.quantity)}
                            </strong>
                        </div>
                    </div>
                ))}

                {/* ESTADO VAZIO */}
                {products.length === 0 && (
                    <div className="border border-dashed border-brand-border bg-white/50 p-8 text-center">
                        <p className="text-xs tracking-wide text-[var(--color-brand-muted)]">
                            Seu carrinho está vazio.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}