# Sync Shared Product Schema and Add Controller Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync the shared product schema with the database, fix ineffective sanitization in the product service, and add missing unit tests for the product controller.

**Architecture:** 
- Update the Zod schema in the shared package to include the `slug` field.
- Refactor `ProductService.create` to use the validated data from Zod.
- Create a new test file for `ProductController` using Vitest and NestJS Testing Utilities.

**Tech Stack:** NestJS, Prisma, Zod, Vitest.

---

### Task 1: Update Shared Product Schema

**Files:**
- Modify: `packages/shared/src/schemas/product.ts`

- [ ] **Step 1: Add slug to CreateProductSchema**

```typescript
export const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1), // Added slug
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  brand: z.string().min(1),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  description: z.string().optional(),
});
```

- [ ] **Step 2: Verify shared package tests (if any)**

Run: `pnpm --filter shared test`

### Task 2: Fix Ineffective Sanitization in ProductService

**Files:**
- Modify: `apps/api/src/catalog/product.service.ts`

- [ ] **Step 1: Use validated data in create method**

```typescript
  async create(data: any) {
    // Validate with Zod and get sanitized data
    const validatedData = CreateProductSchema.parse(data);

    return this.prisma.product.create({
      data: validatedData,
    });
  }
```

- [ ] **Step 2: Run ProductService tests**

Run: `pnpm --filter api test apps/api/src/catalog/product.service.spec.ts`
Expected: PASS

### Task 3: Add ProductController Unit Tests

**Files:**
- Create: `apps/api/src/catalog/product.controller.spec.ts`

- [ ] **Step 1: Write unit tests for ProductController**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const products = [{ id: '1', name: 'Product 1', slug: 'p1', price: 100, brand: 'B', stock: 1, categoryId: 'c1' }];
    mockProductService.findAll.mockResolvedValue(products);
    
    const result = await controller.findAll();
    
    expect(result).toEqual(products);
    expect(mockProductService.findAll).toHaveBeenCalled();
  });

  it('findOne should return a product', async () => {
    const product = { id: '1', name: 'Product 1' };
    mockProductService.findOne.mockResolvedValue(product);
    
    const result = await controller.findOne('1');
    
    expect(result).toEqual(product);
    expect(mockProductService.findOne).toHaveBeenCalledWith('1');
  });

  it('create should create a product', async () => {
    const dto = { name: 'New', slug: 'new', price: 10, brand: 'B', stock: 1, categoryId: 'c1' };
    const product = { id: '1', ...dto };
    mockProductService.create.mockResolvedValue(product);
    
    const result = await controller.create(dto as any);
    
    expect(result).toEqual(product);
    expect(mockProductService.create).toHaveBeenCalledWith(dto);
  });

  it('update should update a product', async () => {
    const id = '1';
    const dto = { name: 'Updated' };
    const product = { id, name: 'Updated' };
    mockProductService.update.mockResolvedValue(product);
    
    const result = await controller.update(id, dto as any);
    
    expect(result).toEqual(product);
    expect(mockProductService.update).toHaveBeenCalledWith(id, dto);
  });

  it('remove should delete a product', async () => {
    const id = '1';
    mockProductService.remove.mockResolvedValue({ id });
    
    const result = await controller.remove(id);
    
    expect(result).toEqual({ id });
    expect(mockProductService.remove).toHaveBeenCalledWith(id);
  });
});
```

- [ ] **Step 2: Run ProductController tests**

Run: `pnpm --filter api test apps/api/src/catalog/product.controller.spec.ts`
Expected: PASS

### Task 4: Final Verification and Commit

- [ ] **Step 1: Run all tests in the project**

Run: `pnpm test`
Expected: ALL PASS

- [ ] **Step 2: Commit changes**

```bash
git add packages/shared/src/schemas/product.ts apps/api/src/catalog/product.service.ts apps/api/src/catalog/product.controller.spec.ts
git commit -m "fix: sync shared product schema and add controller tests"
```
