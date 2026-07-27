'use client';

import { useEffect } from 'react';
import type { Product } from '@/interfaces/Product';
import { useCartStore } from '@/store/cartStore';
import LoadingOverlay from '@/components/LoadingOverlay';
import ProductsList from './ProductsList';

interface StoreProductsProps {
    products: Product[];
}

export default function StoreProducts({
    products,
}: StoreProductsProps) {
    const hydrated = useCartStore(
        (state) => state.hydrated
    );

    const syncProducts = useCartStore(
        (state) => state.syncProducts
    );

    useEffect(() => {
        syncProducts(products);
    }, [products, syncProducts]);

    return (
        <>
            {!hydrated && (
                <LoadingOverlay
                    visible
                    message="Carregando carrinho..."
                />
            )}

            <ProductsList products={products} />
        </>
    );
}