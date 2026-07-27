//store/cartStore.ts
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
          products: state.products.flatMap((cartItem) => {
            const updatedProduct = freshProducts.find(
              (product) => String(product.id) === String(cartItem.id)
            );

            if (!updatedProduct) {
              return [];
            }

            const stock =
              typeof updatedProduct.stock === 'number'
                ? updatedProduct.stock
                : cartItem.quantity;

            const availableQuantity = Math.min(cartItem.quantity, stock);

            if (availableQuantity <= 0) {
              return [];
            }

            const updatedPrice = getUnitPrice(
              Number(updatedProduct.base_price),
              availableQuantity,
              updatedProduct.pricing_rules
            );

            return [
              {
                ...cartItem,
                title: updatedProduct.title,
                description: updatedProduct.description,
                image_url: updatedProduct.image_url,
                stock: updatedProduct.stock,
                base_price: updatedProduct.base_price,
                pricing_rules: updatedProduct.pricing_rules,
                quantity: availableQuantity,
                price: updatedPrice,
              },
            ];
          }),
        })),

      addToCart: (product) =>
        set((state) => {
          const existingIndex = state.products.findIndex(
            (item) => item.id === product.id
          );

          if (Number(product.stock) <= 0) {
            return state;
          }

          if (existingIndex !== -1) {
            const newProducts = [...state.products];
            const existingItem = newProducts[existingIndex];

            if (existingItem.quantity >= product.stock) {
              return state;
            }

            const updatedQuantity = existingItem.quantity + 1;

            const updatedPrice = getUnitPrice(
              product.base_price,
              updatedQuantity,
              product.pricing_rules
            );

            newProducts[existingIndex] = {
              ...existingItem,
              title: product.title,
              image_url: product.image_url,
              stock: product.stock,
              quantity: updatedQuantity,
              price: updatedPrice,
              base_price: product.base_price,
              pricing_rules: product.pricing_rules,
            };

            return {
              products: newProducts,
            };
          }

          const initialQuantity = 1;

          return {
            products: [
              ...state.products,
              {
                ...product,
                quantity: initialQuantity,
                price: getUnitPrice(
                  product.base_price,
                  initialQuantity,
                  product.pricing_rules
                ),
              },
            ],
          };
        }),

      increase: (id) =>
        set((state) => ({
          products: state.products.map((item) => {
            if (item.id !== id) {
              return item;
            }

            if (typeof item.stock === 'number' && item.quantity >= item.stock) {
              return item;
            }

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
          products: state.products.flatMap((item) => {
            if (item.id !== id) {
              return [item];
            }

            if (item.quantity <= 1) {
              return [];
            }

            const updatedQuantity = item.quantity - 1;

            return [
              {
                ...item,
                quantity: updatedQuantity,
                price: getUnitPrice(
                  item.base_price,
                  updatedQuantity,
                  item.pricing_rules
                ),
              },
            ];
          }),
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
