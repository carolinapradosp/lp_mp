// lib/checkout/parse-checkout-input.ts

import { CheckoutError } from './checkout-error';
import type {
  CheckoutCustomerInput,
  CheckoutInput,
  CheckoutItemInput,
  CheckoutPaymentInput,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new CheckoutError({
      code: 'INVALID_CHECKOUT_INPUT',
      message: `O campo "${field}" é obrigatório.`,
      statusCode: 400,
    });
  }

  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function cleanDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function parseItems(value: unknown): CheckoutItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CheckoutError({
      code: 'EMPTY_CART',
      message: 'O carrinho está vazio.',
      statusCode: 400,
    });
  }

  const groupedItems = new Map<string, number>();

  for (const rawItem of value) {
    if (!isRecord(rawItem)) {
      throw new CheckoutError({
        code: 'INVALID_CHECKOUT_ITEM',
        message: 'Há um item inválido no carrinho.',
        statusCode: 400,
      });
    }

    const productId = requiredString(rawItem.productId, 'items.productId');

    const quantity = Number(rawItem.quantity);

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new CheckoutError({
        code: 'INVALID_QUANTITY',
        message:
          'A quantidade dos produtos deve ser um número inteiro positivo.',
        statusCode: 400,
      });
    }

    const accumulated = (groupedItems.get(productId) ?? 0) + quantity;

    if (!Number.isSafeInteger(accumulated)) {
      throw new CheckoutError({
        code: 'INVALID_QUANTITY',
        message: 'Quantidade de produto inválida.',
        statusCode: 400,
      });
    }

    groupedItems.set(productId, accumulated);
  }

  return Array.from(groupedItems, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function parsePayment(value: unknown): CheckoutPaymentInput {
  if (!isRecord(value)) {
    throw new CheckoutError({
      code: 'INVALID_PAYMENT_DATA',
      message: 'Os dados do pagamento são inválidos.',
      statusCode: 400,
    });
  }

  const paymentMethodId = requiredString(
    value.paymentMethodId,
    'payment.paymentMethodId'
  );

  const installments =
    value.installments === undefined || value.installments === null
      ? 1
      : Number(value.installments);

  if (
    !Number.isSafeInteger(installments) ||
    installments < 1 ||
    installments > 12
  ) {
    throw new CheckoutError({
      code: 'INVALID_INSTALLMENTS',
      message: 'O número de parcelas é inválido.',
      statusCode: 400,
    });
  }

  const issuerId =
    typeof value.issuerId === 'string' || typeof value.issuerId === 'number'
      ? value.issuerId
      : undefined;

  return {
    token: optionalString(value.token),
    paymentMethodId,
    issuerId,
    installments,
  };
}

function parseCustomer(value: unknown): CheckoutCustomerInput {
  if (!isRecord(value)) {
    throw new CheckoutError({
      code: 'INVALID_CUSTOMER',
      message: 'Os dados do cliente são inválidos.',
      statusCode: 400,
    });
  }

  if (!isRecord(value.identification)) {
    throw new CheckoutError({
      code: 'INVALID_IDENTIFICATION',
      message: 'Os dados de identificação são inválidos.',
      statusCode: 400,
    });
  }

  if (!isRecord(value.address)) {
    throw new CheckoutError({
      code: 'INVALID_ADDRESS',
      message: 'O endereço de entrega é inválido.',
      statusCode: 400,
    });
  }

  const email = requiredString(value.email, 'customer.email').toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CheckoutError({
      code: 'INVALID_EMAIL',
      message: 'Informe um e-mail válido.',
      statusCode: 400,
    });
  }

  const cpf = cleanDigits(
    requiredString(
      value.identification.number,
      'customer.identification.number'
    )
  );

  if (cpf.length !== 11) {
    throw new CheckoutError({
      code: 'INVALID_CPF',
      message: 'Informe um CPF válido.',
      statusCode: 400,
    });
  }

  const phone = cleanDigits(requiredString(value.phone, 'customer.phone'));

  if (phone.length < 10 || phone.length > 11) {
    throw new CheckoutError({
      code: 'INVALID_PHONE',
      message: 'Informe um telefone válido.',
      statusCode: 400,
    });
  }

  const zipCode = cleanDigits(
    requiredString(value.address.zipCode, 'customer.address.zipCode')
  );

  if (zipCode.length !== 8) {
    throw new CheckoutError({
      code: 'INVALID_ZIP_CODE',
      message: 'Informe um CEP válido.',
      statusCode: 400,
    });
  }

  const federalUnit = requiredString(
    value.address.federalUnit,
    'customer.address.federalUnit'
  ).toUpperCase();

  if (!/^[A-Z]{2}$/.test(federalUnit)) {
    throw new CheckoutError({
      code: 'INVALID_STATE',
      message: 'Informe uma UF válida.',
      statusCode: 400,
    });
  }

  return {
    firstName: requiredString(value.firstName, 'customer.firstName'),

    lastName: optionalString(value.lastName) ?? '',

    email,
    phone,

    identification: {
      type: 'CPF',
      number: cpf,
    },

    address: {
      zipCode,
      federalUnit,

      city: requiredString(value.address.city, 'customer.address.city'),

      neighborhood: requiredString(
        value.address.neighborhood,
        'customer.address.neighborhood'
      ),

      streetName: requiredString(
        value.address.streetName,
        'customer.address.streetName'
      ),

      streetNumber: requiredString(
        value.address.streetNumber,
        'customer.address.streetNumber'
      ),

      complement: optionalString(value.address.complement) ?? '',
    },
  };
}

export function parseCheckoutInput(value: unknown): CheckoutInput {
  if (!isRecord(value)) {
    throw new CheckoutError({
      code: 'INVALID_CHECKOUT_INPUT',
      message: 'Os dados do checkout são inválidos.',
      statusCode: 400,
    });
  }

  return {
    items: parseItems(value.items),
    payment: parsePayment(value.payment),
    customer: parseCustomer(value.customer),
  };
}
