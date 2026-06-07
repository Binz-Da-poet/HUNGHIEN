import { describe, it, expect } from 'vitest';
import { CreateOrderSchema, TrackOrderSchema } from './order';

describe('CreateOrderSchema', () => {
  const validOrder = {
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    paymentMethod: 'COD' as const,
    items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 }],
  };

  it('accepts a valid COD order', () => {
    const result = CreateOrderSchema.parse(validOrder);
    expect(result.items).toHaveLength(1);
    expect(result.paymentMethod).toBe('COD');
  });

  it('accepts a valid BANK_TRANSFER order', () => {
    const result = CreateOrderSchema.parse({
      ...validOrder,
      paymentMethod: 'BANK_TRANSFER',
    });
    expect(result.paymentMethod).toBe('BANK_TRANSFER');
  });

  it('rejects invalid payment method', () => {
    expect(() =>
      CreateOrderSchema.parse({ ...validOrder, paymentMethod: 'CARD' }),
    ).toThrow();
  });

  it('rejects an empty items array', () => {
    expect(() =>
      CreateOrderSchema.parse({ ...validOrder, items: [] }),
    ).toThrow('Giỏ hàng trống');
  });

  it('rejects more than 50 items', () => {
    const orderWithManyItems = {
      ...validOrder,
      items: Array.from({ length: 51 }, (_, i) => ({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 1,
      })),
    };
    expect(() => CreateOrderSchema.parse(orderWithManyItems)).toThrow('Tối đa 50');
  });

  it('rejects quantity > 99', () => {
    expect(() =>
      CreateOrderSchema.parse({
        ...validOrder,
        items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 100 }],
      }),
    ).toThrow('Tối đa 99');
  });

  it('rejects quantity < 1', () => {
    expect(() =>
      CreateOrderSchema.parse({
        ...validOrder,
        items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 0 }],
      }),
    ).toThrow('Số lượng tối thiểu là 1');
  });

  it('rejects invalid phone formats', () => {
    expect(() =>
      CreateOrderSchema.parse({ ...validOrder, phone: '12345' }),
    ).toThrow('Số điện thoại');
  });

  it('accepts checkoutAttemptId as optional UUID', () => {
    const result = CreateOrderSchema.parse({
      ...validOrder,
      checkoutAttemptId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.checkoutAttemptId).toBe('550e8400-e29b-41d4-a716-446655440001');
  });

  it('accepts without checkoutAttemptId', () => {
    const result = CreateOrderSchema.parse(validOrder);
    expect(result.checkoutAttemptId).toBeUndefined();
  });

  it('rejects empty customer name', () => {
    expect(() =>
      CreateOrderSchema.parse({ ...validOrder, customerName: '' }),
    ).toThrow('Vui lòng nhập họ tên');
  });

  it('rejects empty address', () => {
    expect(() =>
      CreateOrderSchema.parse({ ...validOrder, address: '' }),
    ).toThrow('Vui lòng nhập địa chỉ');
  });
});

describe('TrackOrderSchema', () => {
  it('accepts valid tracking input', () => {
    const result = TrackOrderSchema.parse({
      publicCode: 'HH-ABCD123456',
      phone: '0912345678',
    });
    expect(result.publicCode).toBe('HH-ABCD123456');
    expect(result.phone).toBe('0912345678');
  });

  it('rejects empty publicCode', () => {
    expect(() =>
      TrackOrderSchema.parse({ publicCode: '', phone: '0912345678' }),
    ).toThrow();
  });

  it('rejects invalid phone', () => {
    expect(() =>
      TrackOrderSchema.parse({ publicCode: 'HH-ABCD', phone: '999' }),
    ).toThrow('Số điện thoại');
  });
});
