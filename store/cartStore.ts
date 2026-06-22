import { CartStore, Product } from '@/interfaces/Product';
import getUnitPrice from '@/utils/cart';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartHydration = {
  hydrated: boolean;
  setHydrated: (state: boolean) => void;
  syncProducts: (freshProducts: Product[]) => void;
};

export const useCartStore = create<CartStore & CartHydration>()(
  persist(
    (set) => ({
      hydrated: false,

      setHydrated: (state) => {
        set({
          hydrated: state,
        });
      },

      products: [],

      syncProducts: (freshProducts: Product[]) =>
        set((state) => ({
          products: state.products.map((cartItem) => {
            const updatedProduct = freshProducts.find(
              (p) => p.id === cartItem.id
            );

            // Se o produto não existir mais no backend,
            // mantém o item atual
            if (!updatedProduct) return cartItem;

            const updatedPrice = getUnitPrice(
              updatedProduct.base_price,
              cartItem.quantity,
              updatedProduct.pricing_rules
            );

            return {
              ...cartItem,

              // Dados atualizados do backend
              title: updatedProduct.title,
              image_url: updatedProduct.image_url,
              base_price: Number(updatedProduct.base_price),
              pricing_rules: updatedProduct.pricing_rules,

              // Preço recalculado
              price: updatedPrice,
            };
          }),
        })),

      addToCart: (product) =>
        set((state) => {
          const productId = product.id;

          const existingIndex = state.products.findIndex(
            (item) => item.id === productId
          );

          if (existingIndex !== -1) {
            const newProducts = [...state.products];

            const existingItem = newProducts[existingIndex];

            const updatedQuantity = existingItem.quantity + 1;

            const updatedPrice = getUnitPrice(
              product.base_price,
              updatedQuantity,
              product.pricing_rules
            );

            newProducts[existingIndex] = {
              ...existingItem,
              quantity: updatedQuantity,
              price: updatedPrice,
              base_price: Number(product.base_price),
              pricing_rules: product.pricing_rules,
            };

            return {
              products: newProducts,
            };
          }

          const initialQuantity = 1;

          const initialPrice = getUnitPrice(
            product.base_price,
            initialQuantity,
            product.pricing_rules
          );

          return {
            products: [
              ...state.products,
              {
                ...product,
                id: productId,
                quantity: initialQuantity,
                base_price: Number(product.base_price),
                price: initialPrice,
              },
            ],
          };
        }),

      increase: (id) =>
        set((state) => ({
          products: state.products.map((item) => {
            if (item.id !== id) return item;

            const updatedQuantity = item.quantity + 1;

            const updatedPrice = getUnitPrice(
              item.base_price,
              updatedQuantity,
              item.pricing_rules
            );

            return {
              ...item,
              quantity: updatedQuantity,
              price: updatedPrice,
            };
          }),
        })),

      decrease: (id) =>
        set((state) => ({
          products: state.products
            .map((item) => {
              if (item.id !== id) return item;

              const updatedQuantity = item.quantity - 1;

              const updatedPrice = getUnitPrice(
                item.base_price,
                updatedQuantity,
                item.pricing_rules
              );

              return {
                ...item,
                quantity: updatedQuantity,
                price: updatedPrice,
              };
            })
            .filter((item) => item.quantity > 0),
        })),

      remove: (id) =>
        set((state) => ({
          products: state.products.filter((item) => item.id !== id),
        })),

      clear: () =>
        set({
          products: [],
        }),
    }),
    {
      name: 'cart-storage',

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
