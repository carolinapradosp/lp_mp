// store/checkoutStore.ts

import StatusPayment from '@/enum/StatusPayment';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
}

interface CheckoutState {
  paymentId: string | null;
  amount: number;
  status: StatusPayment;
  pixData?: PixData;

  setCheckoutData: (data: {
    paymentId: string;
    amount: number;
    status: StatusPayment;
    pixData?: PixData;
  }) => void;

  clearCheckoutData: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      paymentId: null,
      amount: 0,
      status: StatusPayment.pending,
      pixData: undefined,

      setCheckoutData: (data) =>
        set({
          paymentId: data.paymentId,
          amount: data.amount,
          status: data.status,
          pixData: data.pixData,
        }),

      clearCheckoutData: () =>
        set({
          paymentId: null,
          amount: 0,
          status: StatusPayment.pending,
          pixData: undefined,
        }),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
