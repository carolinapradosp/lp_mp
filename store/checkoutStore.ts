// store/checkoutStore.ts

import StatusPayment from '@/enum/StatusPayment';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PixData {
  qrCode: string;
  qrCodeBase64?: string;
  expirationAt?: string | null;
}

interface SetCheckoutData {
  paymentId: string;
  amount: number;
  status: StatusPayment;
  pixData?: PixData;

  externalReference?: string;
  confirmationToken?: string;
}

interface CheckoutState {
  hydrated: boolean;

  paymentId: string | null;
  externalReference: string | null;
  confirmationToken: string | null;

  amount: number;
  status: StatusPayment;
  pixData?: PixData;

  setHydrated: (hydrated: boolean) => void;
  setCheckoutData: (data: SetCheckoutData) => void;
  clearCheckoutData: () => void;
}

const initialCheckoutState = {
  paymentId: null,
  externalReference: null,
  confirmationToken: null,
  amount: 0,
  status: StatusPayment.pending,
  pixData: undefined,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      hydrated: false,
      ...initialCheckoutState,

      setHydrated: (hydrated) => {
        set({ hydrated });
      },

      setCheckoutData: (data) =>
        set({
          paymentId: data.paymentId,
          externalReference: data.externalReference ?? null,
          confirmationToken: data.confirmationToken ?? null,
          amount: data.amount,
          status: data.status,
          pixData: data.pixData,
        }),

      clearCheckoutData: () => {
        set(initialCheckoutState);
      },
    }),
    {
      name: 'checkout-storage',

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },

      partialize: (state) => ({
        paymentId: state.paymentId,
        externalReference: state.externalReference,
        confirmationToken: state.confirmationToken,
        amount: state.amount,
        status: state.status,
        pixData: state.pixData,
      }),
    }
  )
);
