# Task 2: Shared Package (Types & Validations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the `@repo/shared` package with Zod schemas and TypeScript types for products to be used across the monorepo.

**Architecture:** A shared TypeScript package using Zod for runtime validation and type inference.

**Tech Stack:** TypeScript, Zod, Vitest (for testing).

---

### Task 1: Initialize Shared Package

**Files:**
- Create: `packages/shared/package.json`

- [ ] **Step 1: Create package.json**
```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add packages/shared/package.json
git commit -m "chore(shared): init package.json"
```

### Task 2: Define Product Schema with TDD

**Files:**
- Create: `packages/shared/src/schemas/product.ts`
- Create: `packages/shared/src/schemas/product.test.ts`

- [ ] **Step 1: Write failing tests for Product Schema**
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm test` (or equivalent)
Expected: FAIL (Schema not defined)

- [ ] **Step 3: Implement minimal Product Schema**
```typescript
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  brand: z.string().min(1),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  description: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add packages/shared/src/schemas/product.ts packages/shared/src/schemas/product.test.ts
git commit -m "feat(shared): add product schema with tests"
```

### Task 3: Export Schemas

**Files:**
- Create: `packages/shared/index.ts`

- [ ] **Step 1: Export from index.ts**
```typescript
export * from './src/schemas/product';
```

- [ ] **Step 2: Commit**
```bash
git add packages/shared/index.ts
git commit -m "feat(shared): export product schemas"
```
