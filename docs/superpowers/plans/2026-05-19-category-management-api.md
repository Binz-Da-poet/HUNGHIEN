# Category Management API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD API for Category management in NestJS.

**Architecture:** NestJS Module with Controller and Service, using Prisma for data access. Following TDD.

**Tech Stack:** NestJS, Prisma, Vitest.

---

### Task 1: Category Service (CRUD)

**Files:**
- Create: `apps/api/src/catalog/category.service.ts`
- Create: `apps/api/src/catalog/category.service.spec.ts`

- [ ] **Step 1: Write the failing test for CategoryService**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all categories', async () => {
    const categories = [{ id: '1', name: 'Test', slug: 'test', parentId: null }];
    mockPrismaService.category.findMany.mockResolvedValue(categories);
    const result = await service.findAll();
    expect(result).toEqual(categories);
  });

  it('create should create a category', async () => {
    const dto = { name: 'New', slug: 'new' };
    const category = { id: '1', ...dto, parentId: null };
    mockPrismaService.category.create.mockResolvedValue(category);
    const result = await service.create(dto);
    expect(result).toEqual(category);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter api test apps/api/src/catalog/category.service.spec.ts`
Expected: FAIL (CategoryService not defined)

- [ ] **Step 3: Write minimal implementation for CategoryService**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async create(data: { name: string; slug: string; parentId?: string }) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string; parentId?: string }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter api test apps/api/src/catalog/category.service.spec.ts`
Expected: PASS

### Task 2: Category Controller

**Files:**
- Create: `apps/api/src/catalog/category.controller.ts`
- Create: `apps/api/src/catalog/category.controller.spec.ts`

- [ ] **Step 1: Write the failing test for CategoryController**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return all categories', async () => {
    const categories = [{ id: '1', name: 'Test', slug: 'test', parentId: null }];
    mockCategoryService.findAll.mockResolvedValue(categories);
    const result = await controller.findAll();
    expect(result).toEqual(categories);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter api test apps/api/src/catalog/category.controller.spec.ts`
Expected: FAIL (CategoryController not defined)

- [ ] **Step 3: Write minimal implementation for CategoryController**

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Post()
  create(@Body() createCategoryDto: { name: string; slug: string; parentId?: string }) {
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: { name?: string; slug?: string; parentId?: string }) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter api test apps/api/src/catalog/category.controller.spec.ts`
Expected: PASS

### Task 3: Catalog Module and Integration

**Files:**
- Create: `apps/api/src/catalog/catalog.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create CatalogModule**

```typescript
import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CatalogModule {}
```

- [ ] **Step 2: Register CatalogModule in AppModule**

- [ ] **Step 3: Verify all tests pass**

Run: `pnpm --filter api test`

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/catalog apps/api/src/app.module.ts
git commit -m "feat: implement category management api"
```
