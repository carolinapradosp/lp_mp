//components/Products/ProductCard.tsx
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import getUnitPrice from '@/utils/cart';
import { formatCurrency } from '@/utils/utils';
import { ProductsProps } from '@/interfaces/Product';

type SingleProduct = ProductsProps['products'][number];

interface ProductCardProps {
    product: SingleProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
    const cartItem = useCartStore((state) =>
        state.products.find(
            (item) =>
                String(item.id) === String(product.id),
        ),
    );

    const addToCart = useCartStore(
        (state) => state.addToCart,
    );

    const currentQuantity =
        cartItem?.quantity ?? 1;

    const unitPrice = getUnitPrice(
        product.base_price,
        currentQuantity,
        product.pricing_rules,
    );

    const total = currentQuantity * unitPrice;

    const hasDiscount =
        unitPrice < Number(product.base_price);

    function handleAddToCart() {
        if (isOutOfStock) {
            return;
        }

        addToCart({
            id: product.id,
            title: product.title,
            description: product.description,
            base_price: product.base_price,
            image_url: product.image_url,
            stock: product.stock,
            pricing_rules: product.pricing_rules,
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }



    const isOutOfStock = Number(product.stock) <= 0;

    return (
        <article className="group flex h-full flex-col bg-[var(--color-brand-bg)] transition-all duration-300">

            {/* IMAGEM */}
            <div
                className={`relative flex aspect-square items-center justify-center overflow-hidden border border-brand-border transition-colors duration-300 group-hover:border-[var(--color-brand-bg)] ${product.image_url ? 'bg-white' : 'bg-gray-100'
                    }`}
            >
                {hasDiscount && (
                    <div className="absolute left-3 top-3 z-20 border border-[var(--color-brand-accent)] bg-[var(--color-brand-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand-accent)]">
                        Oferta
                    </div>
                )}

                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="text-center text-xl font-black">
                        Imagem <br />
                        Indisponível
                    </div>
                )}
            </div>

            {/* CONTEÚDO */}
            <div className="flex flex-1 flex-col pt-4">

                {/* INFORMAÇÕES BÁSICAS */}
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-base font-medium tracking-tight text-[var(--color-brand-dark)]">
                        {product.title}
                    </h3>
                    <div className="text-right whitespace-nowrap">
                        {hasDiscount && (
                            <span className="block text-xs text-[var(--color-brand-muted)] line-through">
                                {formatCurrency(product.base_price || 0)}
                            </span>
                        )}
                        <strong className="block text-base font-semibold text-[var(--color-brand-dark)]">
                            {formatCurrency(unitPrice || 0)}
                        </strong>
                    </div>
                </div>

                {/* DESCRIÇÃO */}
                <p className="mb-4 text-xs leading-relaxed text-[var(--color-brand-muted)] line-clamp-2">
                    {product.description}
                </p>

                {/* REGRAS DE NEGÓCIO / TOTAIS MULTI-UNIDADE */}
                {currentQuantity > 1 && (
                    <div className="mb-4 border-t border-dashed border-brand-border pt-3 flex justify-between items-center text-xs">
                        <span className="text-[var(--color-brand-muted)]">
                            {currentQuantity}x unidades (Total)
                        </span>
                        <span className="font-semibold text-[var(--color-brand-dark)]">
                            {formatCurrency(total || 0)}
                        </span>
                    </div>
                )}

                {/* BOTÃO COMPRAR - Estilo Flat Minimalista */}
                <div className="mt-auto">
                    <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        className="
    flex h-11 w-full items-center justify-center
    border border-[var(--color-brand-dark)]
    bg-[var(--color-brand-dark)]
    text-xs font-semibold uppercase tracking-widest
    text-[var(--color-brand-bg)]
    transition-all duration-200
    hover:bg-transparent
    hover:text-[var(--color-brand-dark)]
    disabled:cursor-not-allowed
    disabled:opacity-40
    disabled:hover:bg-[var(--color-brand-dark)]
    disabled:hover:text-[var(--color-brand-bg)]
  "
                    >
                        {isOutOfStock
                            ? 'Indisponível'
                            : 'Adicionar'}
                    </button>
                </div>
            </div>
        </article >
    );
}