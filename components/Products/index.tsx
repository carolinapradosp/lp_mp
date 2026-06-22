import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { ProductsProps } from '@/interfaces/Product';
import getUnitPrice from '@/utils/cart';
import { formatCurrency } from '@/utils/utils';

export default function Products({ products }: ProductsProps) {
    const {
        products: cartProducts,
        addToCart,
    } = useCartStore();

    const handleAddToCart = (
        product: any,
        unitPrice: number,
        quantity: number
    ) => {
        addToCart({
            id: product.id,
            title: product.title,
            price: unitPrice,
            base_price: product.base_price,
            quantity: quantity,
            image_url: product.image_url,
            pricing_rules: product.pricing_rules,
        });

        // Move o scroll para o topo de forma suave
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <section
            className="
                relative
                overflow-hidden
                bg-linear-to-b
                from-[#f8fbff]
                via-[#fdfdfd]
                to-[#eef5ff]
            "
        >
            {/* BG DECOR */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-30
                    top-30
                    h-72
                    w-72
                    rounded-full
                    bg-blue-500/10
                    blur-3xl
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-30
                    right-25
                    h-72
                    w-72
                    rounded-full
                    bg-red-500/10
                    blur-3xl
                "
            />

            <div className="mx-auto w-full max-w-480 px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">

                {/* HEADER */}
                <div className="mb-10 text-center">
                    <span
                        className="
                            inline-flex
                            rounded-full
                            border
                            border-blue-200
                            bg-blue-50
                            px-4
                            py-2
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.2em]
                            text-blue-600
                        "
                    >
                        Produtos em destaque
                    </span>

                    <h2
                        className="
                            mt-5
                            text-4xl
                            font-black
                            tracking-tight
                            text-slate-900
                            lg:text-5xl
                        "
                    >
                        Vender ficou
                        <span className="text-blue-600">
                            {' '}muito mais fácil
                        </span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                        Sua vitrine digital pronta para atrair clientes, gerar pedidos e impulsionar o crescimento do seu negócio.
                    </p>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                    {products.map((product) => {
                        const cartItem = cartProducts.find(
                            (item) =>
                                String(item.id) ===
                                String(product.id)
                        );

                        const quantity =
                            cartItem?.quantity || 1;

                        const unitPrice = getUnitPrice(
                            product.base_price,
                            quantity,
                            product.pricing_rules
                        );

                        const total =
                            quantity * unitPrice;

                        const hasDiscount =
                            unitPrice <
                            product.base_price;

                        return (
                            <article
                                key={product.id}
                                className="
                                    group
                                    relative
                                    flex
                                    h-full
                                    flex-col
                                    overflow-hidden
                                    rounded-4xl
                                    border
                                    border-blue-100
                                    bg-white
                                    transition-all
                                    duration-300
                                    hover:-translate-y-2
                                    hover:border-blue-300
                                    hover:shadow-[0_25px_70px_rgba(37,99,235,0.16)]
                                "
                            >
                                {/* TOPO COLORIDO */}
                                <div
                                    className="
                                        absolute
                                        inset-x-0
                                        top-0
                                        h-2
                                        bg-linear-to-r
                                        from-red-500
                                        via-blue-500
                                        to-blue-700
                                    "
                                />

                                {/* GLOW */}
                                <div
                                    className="
                                        absolute
                                        right-12.5
                                        top-12.5
                                        h-40
                                        w-40
                                        rounded-full
                                        bg-blue-500/10
                                        blur-3xl
                                        transition-all
                                        duration-500
                                        group-hover:bg-blue-500/20
                                    "
                                />

                                {/* IMAGEM */}
                                <div
                                    className="
                                        relative
                                        flex
                                        h-64
                                        items-center
                                        justify-center
                                        overflow-hidden
                                        border-b
                                        border-blue-50
                                        bg-linear-to-b
                                        from-white
                                        to-blue-50/50
                                        p-6
                                    "
                                >
                                    {/* Badge */}
                                    {hasDiscount && (
                                        <div
                                            className="
                                                absolute
                                                left-4
                                                top-4
                                                z-20
                                                rounded-full
                                                bg-red-500
                                                px-3
                                                py-1.5
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wide
                                                text-white
                                                shadow-lg
                                            "
                                        >
                                            Oferta
                                        </div>
                                    )}


                                    {product.image_url && (
                                        <Image
                                            src={
                                                product.image_url
                                            }
                                            alt={product.title}
                                            width={240}
                                            height={240}
                                            className="
                                            relative
                                            z-10
                                            h-auto
                                            max-h-56
                                            w-auto
                                            max-w-full
                                            object-contain
                                            transition-transform
                                            duration-500
                                            group-hover:scale-110
                                        "
                                        />
                                    )}
                                </div>

                                {/* CONTEÚDO */}
                                <div
                                    className="
                                        relative
                                        flex
                                        flex-1
                                        flex-col
                                        overflow-hidden
                                        p-4
                                    "
                                >
                                    {/* BG */}
                                    <div
                                        className="
                                            pointer-events-none
                                            absolute
                                            inset-x-0
                                            bottom-0
                                            h-64
                                            bg-linear-to-t
                                            from-blue-100/70
                                            via-blue-50/20
                                            to-transparent
                                        "
                                    />

                                    <div className="relative z-10 flex flex-1 flex-col">

                                        {/* TITULO */}
                                        <h2
                                            className="
                                                mb-3
                                                min-h-18
                                                text-3xl
                                                font-black
                                                leading-tight
                                                tracking-tight
                                                text-slate-900
                                            "
                                        >
                                            {product.title}
                                        </h2>

                                        {/* DESC */}
                                        <p
                                            className="
                                                mb-6
                                                text-sm
                                                leading-relaxed
                                                text-slate-600
                                            "
                                        >
                                            {product.description}
                                        </p>

                                        {/* BOX PREÇO */}
                                        <div
                                            className="
                                                mb-6
                                                rounded-3xl
                                                border
                                                border-blue-100
                                                bg-white/90
                                                p-4
                                                shadow-[0_10px_35px_rgba(15,23,42,0.05)]
                                                backdrop-blur-sm
                                            "
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-xs font-medium text-slate-500">
                                                    {quantity}{' '}
                                                    {quantity > 1
                                                        ? 'unidades'
                                                        : 'unidade'}
                                                </p>

                                                <div
                                                    className="
                                                    flex
                                                    items-center
                                                        rounded-full
                                                        bg-blue-50
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-bold
                                                        text-blue-600
                                                    "
                                                >
                                                    Compra segura
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                {hasDiscount && (
                                                    <span className="text-sm text-slate-400 line-through">
                                                        {formatCurrency(
                                                            product.base_price ||
                                                            0
                                                        )}
                                                    </span>
                                                )}

                                                <strong
                                                    className="
                                                        mt-1
                                                        block
                                                        text-2xl
                                                        font-black
                                                        tracking-tight
                                                        text-slate-900
                                                    "
                                                >
                                                    {formatCurrency(
                                                        unitPrice || 0
                                                    )}
                                                </strong>

                                                {hasDiscount && (
                                                    <span
                                                        className="
                                                            mt-3
                                                            inline-flex
                                                            w-fit
                                                            rounded-full
                                                            border
                                                            border-red-200
                                                            bg-red-50
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-black
                                                            uppercase
                                                            tracking-wide
                                                            text-red-600
                                                        "
                                                    >
                                                        Desconto aplicado
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className="
                                                    mt-4
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                    border-t
                                                    border-blue-100
                                                    pt-4
                                                "
                                            >
                                                <span className="text-sm font-medium text-slate-500">
                                                    Total:
                                                </span>

                                                <span
                                                    className="
                                                        text-right
                                                        text-2xl
                                                        font-black
                                                        text-blue-600
                                                    "
                                                >
                                                    {formatCurrency(
                                                        total || 0
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* BTN */}
                                        <div className="mt-auto">
                                            <button
                                                onClick={() =>
                                                    handleAddToCart(
                                                        product,
                                                        unitPrice,
                                                        quantity
                                                    )
                                                }
                                                className="
                                                    relative
                                                    flex
                                                    h-14
                                                    w-full
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-2xl
                                                    bg-linear-to-r
                                                    from-red-500
                                                    via-blue-600
                                                    to-blue-700
                                                    px-5
                                                    text-sm
                                                    font-black
                                                    uppercase
                                                    tracking-[0.15em]
                                                    text-white
                                                    transition-all
                                                    duration-300
                                                    hover:scale-[1.02]
                                                    hover:shadow-[0_18px_40px_rgba(37,99,235,0.35)]
                                                    active:scale-[0.99]
                                                "
                                            >
                                                <span className="relative z-10">
                                                    Adicionar ao carrinho
                                                </span>

                                                <div
                                                    className="
                                                        absolute
                                                        inset-0
                                                        bg-white/10
                                                        opacity-0
                                                        transition-opacity
                                                        duration-300
                                                        group-hover:opacity-100
                                                    "
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}