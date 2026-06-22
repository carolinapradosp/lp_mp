import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/utils";
import Image from "next/image";

export default function ResumoPedido() {
    const { products } = useCartStore();

    return (
        <div className="mb-10">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">
                    Seu pedido
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {products.length} {products.length > 1 ? 'itens' : 'item'}
                </span>
            </div>

            <div className="space-y-3">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]"
                    >
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-blue-50/70 to-transparent" />

                        {/* MOBILE */}
                        <div className="relative z-10 flex flex-col gap-3 md:hidden">
                            <div className="flex items-center gap-3">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2">
                                    <Image
                                        src={product.image_url}
                                        alt={product.title}
                                        width={58}
                                        height={58}
                                        className="h-14.5 w-14.5 object-contain"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-semibold leading-tight text-neutral-900 wrap-break-words">
                                        {product.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Quantidade:{" "}
                                        <span className="font-medium text-neutral-700">
                                            {product.quantity}
                                        </span>
                                    </p>

                                    <strong className="mt-2 block text-2xl font-bold leading-none text-blue-600">
                                        {formatCurrency(
                                            product.price * product.quantity
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* DESKTOP */}
                        <div className="relative z-10 hidden items-center gap-4 md:flex">
                            <div className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2">
                                <Image
                                    src={product.image_url}
                                    alt={product.title}
                                    width={70}
                                    height={70}
                                    className="h-17.5 w-17.5 object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-semibold leading-tight text-neutral-900">
                                    {product.title}
                                </h3>

                                <p className="mt-2 text-sm text-neutral-500">
                                    Quantidade:{" "}
                                    <span className="font-medium text-neutral-700">
                                        {product.quantity}
                                    </span>
                                </p>
                            </div>

                            <div className="text-right">
                                <strong className="block text-2xl font-bold text-blue-600">
                                    {formatCurrency(
                                        product.price * product.quantity
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                        <p className="text-neutral-500">
                            Seu carrinho está vazio.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}