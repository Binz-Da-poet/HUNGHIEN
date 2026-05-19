import { describe, it, expect } from 'vitest';
import { CreateProductSchema } from './product';

describe('CreateProductSchema', () => {
  it('should validate a valid product', () => {
    const validProduct = {
      name: 'iPhone 15',
      price: 999,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should fail if name is empty', () => {
    const invalidProduct = {
      name: '',
      price: 999,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  it('should fail if price is not positive', () => {
    const invalidProduct = {
      name: 'iPhone 15',
      price: 0,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });
});
