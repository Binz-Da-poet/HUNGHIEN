# Refactor Category DTOs and Complete Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor category management to use DTOs with validation and ensure full test coverage for all operations.

**Architecture:** Create dedicated DTO classes with `class-validator` decorators. Update `CategoryController` and `CategoryService` to use these DTOs. Add missing unit tests for `update` and `delete` operations in both service and controller.

**Tech Stack:** NestJS, class-validator, class-transformer, Prisma, Vitest.

---

### Task 1: Install Dependencies

- [ ] **Step 1: Install class-validator and class-transformer in apps/api**

Run: `pnpm --filter api add class-validator class-transformer`
Expected: Success

### Task 2: Create Category DTOs

**Files:**
- Create: `apps/api/src/catalog/dto/create-category.dto.ts`
- Create: `apps/api/src/catalog/dto/update-category.dto.ts`

- [ ] **Step 1: Create CreateCategoryDto**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
```

- [ ] **Step 2: Create UpdateCategoryDto**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```
*Note: We need @nestjs/mapped-types for PartialType.*

- [ ] **Step 3: Install @nestjs/mapped-types in apps/api**

Run: `pnpm --filter api add @nestjs/mapped-types`
Expected: Success

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/catalog/dto/
git commit -m "feat(api): add category DTOs"
```

### Task 3: Update Controller and Service to use DTOs

**Files:**
- Modify: `apps/api/src/catalog/category.controller.ts`
- Modify: `apps/api/src/catalog/category.service.ts`

- [ ] **Step 1: Update CategoryService**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async create(data: CreateCategoryDto) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
```

- [ ] **Step 2: Update CategoryController**

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/catalog/category.controller.ts apps/api/src/catalog/category.service.ts
git commit -m "refactor(api): use category DTOs in controller and service"
```

### Task 4: Complete CategoryService Tests

**Files:**
- Modify: `apps/api/src/catalog/category.service.spec.ts`

- [ ] **Step 1: Add update and delete tests to CategoryService**

```typescript
  it('update should update a category', async () => {
    const dto = { name: 'Updated' };
    const category = { id: '1', name: 'Updated', slug: 'new', parentId: null };
    mockPrismaService.category.update.mockResolvedValue(category);
    const result = await service.update('1', dto);
    expect(result).toEqual(category);
    expect(mockPrismaService.category.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: dto,
    });
  });

  it('delete should delete a category', async () => {
    mockPrismaService.category.delete.mockResolvedValue({ id: '1' });
    const result = await service.delete('1');
    expect(result).toEqual({ id: '1' });
    expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });
```

- [ ] **Step 2: Run service tests**

Run: `pnpm --filter api test apps/api/src/catalog/category.service.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/catalog/category.service.spec.ts
git commit -m "test(api): add update and delete tests for CategoryService"
```

### Task 5: Complete CategoryController Tests

**Files:**
- Modify: `apps/api/src/catalog/category.controller.spec.ts`

- [ ] **Step 1: Add create, update and delete tests to CategoryController**

```typescript
  it('create should create a category', async () => {
    const dto = { name: 'New', slug: 'new' };
    const category = { id: '1', ...dto, parentId: null };
    mockCategoryService.create.mockResolvedValue(category);
    const result = await controller.create(dto);
    expect(result).toEqual(category);
    expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
  });

  it('update should update a category', async () => {
    const dto = { name: 'Updated' };
    const category = { id: '1', name: 'Updated', slug: 'new', parentId: null };
    mockCategoryService.update.mockResolvedValue(category);
    const result = await controller.update('1', dto);
    expect(result).toEqual(category);
    expect(mockCategoryService.update).toHaveBeenCalledWith('1', dto);
  });

  it('remove should delete a category', async () => {
    mockCategoryService.delete.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1');
    expect(result).toEqual({ id: '1' });
    expect(mockCategoryService.delete).toHaveBeenCalledWith('1');
  });
```

- [ ] **Step 2: Run controller tests**

Run: `pnpm --filter api test apps/api/src/catalog/category.controller.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/catalog/category.controller.spec.ts
git commit -m "test(api): add missing tests for CategoryController"
```

### Task 6: Final Verification

- [ ] **Step 1: Run all tests in apps/api**

Run: `pnpm --filter api test`
Expected: All tests PASS

- [ ] **Step 2: Final commit if any changes needed**

```bash
git commit -m "refactor: add category DTOs and complete test coverage"
```
