import { OrderStatus, PaymentStatus } from '@prisma/client';

/** Valid shipping status transitions */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/** Valid payment status transitions */
export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ['PAID'],
  PAID: ['REFUNDED'],
  REFUNDED: [],
};

export function isValidOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = ORDER_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function isValidPaymentTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  const allowed = PAYMENT_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
