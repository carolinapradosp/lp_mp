// app/(store)/page.tsx

import StoreProducts from '@/components/StoreProducts';
import { getProductsFromDatabase } from '@/lib/products/queries';

export default async function Home() {
  const products = await getProductsFromDatabase();

  return (
    <main className="min-h-screen">
      <StoreProducts products={products} />
    </main>
  );
}