// lib/checkout/types.ts

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

export type CheckoutPaymentInput = {
  token?: string;
  paymentMethodId: string;
  issuerId?: string | number;
  installments?: number;
};

export type CheckoutCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  identification: {
    type: 'CPF';
    number: string;
  };

  address: {
    zipCode: string;
    federalUnit: string;
    city: string;
    neighborhood: string;
    streetName: string;
    streetNumber: string;
    complement?: string;
  };
};

export type CheckoutInput = {
  items: CheckoutItemInput[];
  payment: CheckoutPaymentInput;
  customer: CheckoutCustomerInput;
};

export type CalculatedOrderItem = {
  productId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  quantity: number;
  stock: number;
  unitPrice: number;
  totalPrice: number;
};

export type CalculatedOrder = {
  items: CalculatedOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
};
