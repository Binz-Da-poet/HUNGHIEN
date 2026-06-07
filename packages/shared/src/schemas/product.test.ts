import { describe, it, expect } from 'vitest';
import { CreateProductSchema } from './product';

describe('CreateProductSchema', () => {
  it('should validate a valid product', () => {
    const validProduct = {
      name: 'iPhone 15',
      slug: 'iphone-15',
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
      slug: 'iphone-15',
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
      slug: 'iphone-15',
      price: 0,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  it('should reject originalPrice lower than price', () => {
    const invalidProduct = {
      name: 'iPhone 15',
      slug: 'iphone-15',
      price: 999,
      originalPrice: 500,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('originalPrice'))).toBe(true);
    }
  });

  it('should reject negative stock', () => {
    const invalidProduct = {
      name: 'iPhone 15',
      slug: 'iphone-15',
      price: 999,
      brand: 'Apple',
      stock: -5,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  it('should accept originalPrice equal to price', () => {
    const validProduct = {
      name: 'iPhone 15',
      slug: 'iphone-15',
      price: 999,
      originalPrice: 999,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should accept originalPrice higher than price (valid discount)', () => {
    const validProduct = {
      name: 'iPhone 15',
      slug: 'iphone-15',
      price: 799,
      originalPrice: 999,
      brand: 'Apple',
      stock: 50,
      categoryId: 'electronics-id',
    };
    const result = CreateProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });
});
