import { describe, it, expect } from 'vitest';
import {
  isValidOrderTransition,
  isValidPaymentTransition,
} from './order-transitions';

describe('isValidOrderTransition', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(isValidOrderTransition('PENDING', 'CONFIRMED')).toBe(true);
  });

  it('allows PENDING → CANCELLED', () => {
    expect(isValidOrderTransition('PENDING', 'CANCELLED')).toBe(true);
  });

  it('allows CONFIRMED → SHIPPING', () => {
    expect(isValidOrderTransition('CONFIRMED', 'SHIPPING')).toBe(true);
  });

  it('allows CONFIRMED → CANCELLED', () => {
    expect(isValidOrderTransition('CONFIRMED', 'CANCELLED')).toBe(true);
  });

  it('allows SHIPPING → COMPLETED', () => {
    expect(isValidOrderTransition('SHIPPING', 'COMPLETED')).toBe(true);
  });

  it('rejects PENDING → SHIPPING', () => {
    expect(isValidOrderTransition('PENDING', 'SHIPPING')).toBe(false);
  });

  it('rejects PENDING → COMPLETED', () => {
    expect(isValidOrderTransition('PENDING', 'COMPLETED')).toBe(false);
  });

  it('rejects SHIPPING → CANCELLED', () => {
    expect(isValidOrderTransition('SHIPPING', 'CANCELLED')).toBe(false);
  });

  it('rejects COMPLETED → anything', () => {
    expect(isValidOrderTransition('COMPLETED', 'PENDING')).toBe(false);
    expect(isValidOrderTransition('COMPLETED', 'SHIPPING')).toBe(false);
    expect(isValidOrderTransition('COMPLETED', 'CANCELLED')).toBe(false);
  });

  it('rejects CANCELLED → anything', () => {
    expect(isValidOrderTransition('CANCELLED', 'PENDING')).toBe(false);
    expect(isValidOrderTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(isValidOrderTransition('CANCELLED', 'COMPLETED')).toBe(false);
  });

  it('rejects same status', () => {
    expect(isValidOrderTransition('PENDING', 'PENDING')).toBe(false);
    expect(isValidOrderTransition('CONFIRMED', 'CONFIRMED')).toBe(false);
  });
});

describe('isValidPaymentTransition', () => {
  it('allows UNPAID → PAID', () => {
    expect(isValidPaymentTransition('UNPAID', 'PAID')).toBe(true);
  });

  it('allows PAID → REFUNDED', () => {
    expect(isValidPaymentTransition('PAID', 'REFUNDED')).toBe(true);
  });

  it('rejects UNPAID → REFUNDED', () => {
    expect(isValidPaymentTransition('UNPAID', 'REFUNDED')).toBe(false);
  });

  it('rejects PAID → UNPAID', () => {
    expect(isValidPaymentTransition('PAID', 'UNPAID')).toBe(false);
  });

  it('rejects REFUNDED → anything', () => {
    expect(isValidPaymentTransition('REFUNDED', 'UNPAID')).toBe(false);
    expect(isValidPaymentTransition('REFUNDED', 'PAID')).toBe(false);
  });
});
