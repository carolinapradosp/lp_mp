// lib/checkout/checkout-error.ts

export class CheckoutError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor({
    message,
    code,
    statusCode = 400,
    details,
  }: {
    message: string;
    code: string;
    statusCode?: number;
    details?: unknown;
  }) {
    super(message);

    this.name = 'CheckoutError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isCheckoutError(error: unknown): error is CheckoutError {
  return error instanceof CheckoutError;
}
