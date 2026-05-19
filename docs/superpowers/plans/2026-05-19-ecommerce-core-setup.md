# E-commerce Platform - Plan 1: Core Infrastructure & Shared Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khởi tạo cấu trúc Monorepo (Turborepo), thiết lập cơ sở dữ liệu PostgreSQL với Prisma và định nghĩa các Type dùng chung giữa các ứng dụng.

**Architecture:** Sử dụng Turborepo để quản lý code. Backend NestJS sẽ giao tiếp với PostgreSQL thông qua Prisma ORM. Một package `shared` sẽ chứa các validation schema (Zod) và TypeScript interfaces.

**Tech Stack:** Turborepo, NestJS, Prisma, PostgreSQL, Zod, TypeScript.

---

### Task 1: Khởi tạo Turborepo & Cấu trúc Thư mục

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: Khởi tạo file package.json gốc**
```json
{
  "name": "hung-hien-ecommerce",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "turbo": "latest"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 2: Cấu hình turbo.json**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 3: Khởi tạo pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: Tạo cấu trúc thư mục rỗng**
Run: `mkdir apps packages`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "chore: initialize turborepo structure"
```

---

### Task 2: Thiết lập Package Shared (Types & Validations)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/index.ts`
- Create: `packages/shared/src/schemas/product.ts`

- [ ] **Step 1: Tạo package.json cho shared**
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

- [ ] **Step 2: Định nghĩa Product Schema dùng Zod**
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

- [ ] **Step 3: Export trong index.ts**
```typescript
export * from './src/schemas/product';
```

- [ ] **Step 4: Commit**
```bash
git add packages/shared
git commit -m "feat: add shared package with product schema"
```

---

### Task 3: Thiết lập API NestJS & Prisma

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/prisma/schema.prisma`
- Create: `.env`

- [ ] **Step 1: Khởi tạo prisma schema với các model cốt lõi**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  parentId  String?
  products  Product[]
}

model Product {
  id            String         @id @default(cuid())
  name          String
  slug          String         @unique
  description   String?
  price         Decimal
  originalPrice Decimal?
  brand         String
  stock         Int            @default(0)
  specs         Json?
  status        String         @default("ACTIVE")
  categoryId    String
  category      Category       @relation(fields: [categoryId], references: [id])
  images        ProductImage[]
  orderItems    OrderItem[]
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  url       String
  isPrimary Boolean @default(false)
  product   Product @relation(fields: [productId], references: [id])
}

model Order {
  id             String      @id @default(cuid())
  customerName   String
  phone          String
  address        String
  note           String?
  totalAmount    Decimal
  paymentMethod  String
  status         String      @default("PENDING")
  createdAt      DateTime    @default(now())
  items          OrderItem[]
}

model OrderItem {
  id              String  @id @default(cuid())
  orderId         String
  productId       String
  quantity        Int
  priceAtPurchase Decimal
  order           Order   @relation(fields: [orderId], references: [id])
  product         Product @relation(fields: [productId], references: [id])
}
```

- [ ] **Step 2: Tạo file .env mẫu**
```text
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db?schema=public"
```

- [ ] **Step 3: Khởi tạo package.json cho API (NestJS cơ bản)**
```json
{
  "name": "api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "reflect-metadata": "^0.1.13"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "prisma": "^5.0.0"
  }
}
```

- [ ] **Step 4: Commit**
```bash
git add apps/api .env
git commit -m "feat: setup prisma schema and api package.json"
```
