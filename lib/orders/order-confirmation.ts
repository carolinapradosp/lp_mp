// lib/orders/order-confirmation.ts

import StatusPayment from '@/enum/StatusPayment';

export interface OrderConfirmationPixData {
  qrCode: string;
  expirationAt: string | null;
}

export interface OrderConfirmationData {
  orderId: string;
  externalReference: string;

  amount: number;
  status: StatusPayment;

  paymentId: string | null;
  paymentMethod: string | null;

  pixData: OrderConfirmationPixData | null;

  createdAt: string;
  paidAt: string | null;
}

export interface OrderConfirmationError {
  error: string;
  code:
    | 'CONFIRMATION_TOKEN_REQUIRED'
    | 'ORDER_NOT_FOUND'
    | 'ORDER_STATUS_QUERY_FAILED';
}
