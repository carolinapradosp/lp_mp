'use client';

import { useEffect } from 'react';

import LoadingOverlay from '@/components/LoadingOverlay';
import type { Product } from '@/interfaces/Product';
import { useCartStore } from '@/store/cartStore';

import ProductsList from './ProductsList';

interface StoreProductsProps {
    products: Product[];
}

export default function StoreProducts({
    products,
}: StoreProductsProps) {
    const hydrated = useCartStore(
        (state) => state.hydrated,
    );

    const syncProducts = useCartStore(
        (state) => state.syncProducts,
    );

    useEffect(() => {
        syncProducts(products);
    }, [products, syncProducts]);

    return (
        <div
            data-cart-hydrated={
                hydrated ? 'true' : 'false'
            }
        >
            {!hydrated && (
                <LoadingOverlay
                    visible
                    message="Carregando carrinho..."
                />
            )}

            <ProductsList products={products} />
        </div>
    );
}