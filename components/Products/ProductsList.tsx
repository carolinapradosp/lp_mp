//components/Products/index.tsx


import { ProductsProps } from '@/interfaces/Product';
import ProductCard from './ProductCard';


export default function ProductsList({ products }: ProductsProps) {
    return (
        <section className="relative overflow-hidden bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
            <div className="mx-auto w-full max-w-480 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">

                {/* HEADER */}
                <div className="mb-16 text-center">
                    <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-brand-muted)]">
                        Produtos em destaque
                    </span>

                    <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
                        Vender ficou <span className="font-medium">muito mais fácil</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]">
                        Sua vitrine digital pronta para atrair clientes, gerar pedidos e impulsionar o crescimento do seu negócio.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-sm text-[var(--color-brand-muted)]">
                            Nenhum produto disponível no momento.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

