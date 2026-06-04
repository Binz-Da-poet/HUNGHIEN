import { describe, it, expect } from 'vitest';
import { CreateProductSchema, ProductImageSchema } from './product';

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

  it('should reject decimal prices', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Test',
      slug: 'test',
      price: 99.5,
      brand: 'Brand',
      stock: 1,
      categoryId: 'cat-1',
    });

    expect(result.success).toBe(false);
  });

  it('should accept whole-number VND prices', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Test',
      slug: 'test',
      price: 22990000,
      originalPrice: 24990000,
      brand: 'Brand',
      stock: 1,
      categoryId: 'cat-1',
    });

    expect(result.success).toBe(true);
  });
});

it('should validate product image metadata', () => {
  const result = ProductImageSchema.safeParse({
    id: 'image-1',
    productId: 'product-1',
    url: '/uploads/products/product-1/image.webp',
    altText: 'Ảnh chính iPhone 15',
    sortOrder: 0,
    isPrimary: true,
  });

  expect(result.success).toBe(true);
});

it('should fail product image metadata without a URL', () => {
  const result = ProductImageSchema.safeParse({
    id: 'image-1',
    productId: 'product-1',
    url: '',
    sortOrder: 0,
    isPrimary: false,
  });

  expect(result.success).toBe(false);
});
