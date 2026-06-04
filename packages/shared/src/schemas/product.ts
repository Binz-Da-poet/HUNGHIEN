import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  brand: z.string().min(1),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  description: z.string().optional(),
});

export const ProductImageSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  url: z.string().min(1),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const ProductSchema = CreateProductSchema.extend({
  id: z.string().min(1),
  originalPrice: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  images: z.array(ProductImageSchema).default([]),
});

export type ProductImageInput = z.infer<typeof ProductImageSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
