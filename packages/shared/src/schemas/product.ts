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

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
