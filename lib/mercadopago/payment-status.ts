// lib/mercadopago/payment-status.ts

export const MP_PAYMENT_STATUSES = [
  'pending',
  'approved',
  'authorized',
  'in_process',
  'in_mediation',
  'rejected',
  'cancelled',
  'refunded',
  'charged_back',
] as const;

export type MPStatus = (typeof MP_PAYMENT_STATUSES)[number];

const FINAL_STATUSES = new Set<MPStatus>([
  'rejected',
  'cancelled',
  'refunded',
  'charged_back',
]);

export function isMPStatus(value: unknown): value is MPStatus {
  return (
    typeof value === 'string' && MP_PAYMENT_STATUSES.includes(value as MPStatus)
  );
}

export function isRefundLikeStatus(status: string): boolean {
  return (
    status === 'refunded' || status === 'charged_back' || status === 'cancelled'
  );
}

export function shouldUpdatePaymentStatus({
  currentStatus,
  nextStatus,
}: {
  currentStatus: string | null;
  nextStatus: MPStatus;
}): boolean {
  if (!currentStatus) {
    return true;
  }

  if (currentStatus === nextStatus) {
    return false;
  }

  /*
   * Reembolso e chargeback podem acontecer depois
   * de uma aprovação.
   */
  if (
    currentStatus === 'approved' &&
    (nextStatus === 'refunded' || nextStatus === 'charged_back')
  ) {
    return true;
  }

  /*
   * Um pagamento autorizado pode ser aprovado
   * posteriormente.
   */
  if (currentStatus === 'authorized' && nextStatus === 'approved') {
    return true;
  }

  /*
   * Estados temporários podem evoluir.
   */
  if (
    currentStatus === 'pending' ||
    currentStatus === 'in_process' ||
    currentStatus === 'in_mediation'
  ) {
    return true;
  }

  /*
   * Estados finais não devem regredir para
   * estados temporários ou outros estados finais.
   */
  if (FINAL_STATUSES.has(currentStatus as MPStatus)) {
    return false;
  }

  return false;
}
