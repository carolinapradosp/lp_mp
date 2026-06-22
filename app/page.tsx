'use client';

import { useEffect, useState } from 'react';
import Products from '@/components/Products';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/interfaces/Product';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const {
    hydrated,
    syncProducts
  } = useCartStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        const response = await fetch('/api/products');
        const data = await response.json();

        const formattedProducts = data.map(
          (product: Product) => ({
            ...product,
            base_price: Number(product.base_price),
          })
        );

        const sortedProducts = formattedProducts.sort((a: Product, b: Product) => {
          return a.title.localeCompare(b.title);
        });

        setProducts(sortedProducts);
        syncProducts(sortedProducts);
      } catch (error) {
        console.error(
          'Erro ao buscar produtos:',
          error
        );
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, [syncProducts]);

  const isLoading = !hydrated || loadingProducts;

  return (
    <>
      {isLoading && <LoadingOverlay visible={isLoading} message='Carregando...' />}
      <main className="min-h-screen bg-[#FAFAFA]">
        <Products
          products={products}
        />
      </main>
    </>
  );
}