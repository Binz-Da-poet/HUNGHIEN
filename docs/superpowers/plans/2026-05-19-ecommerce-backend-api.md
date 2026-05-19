# E-commerce Platform - Plan 2: Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai các API cốt lõi cho Catalog (Danh mục, Sản phẩm) và Order (Đơn hàng) sử dụng NestJS và Prisma.

**Architecture:** Sử dụng kiến trúc Module của NestJS. Mỗi domain (Catalog, Orders) sẽ có Service, Controller riêng. Giao tiếp database qua Prisma Service.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Zod (Validation), TypeScript.

---

### Task 1: Prisma Service & Global Configuration

**Files:**
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Tạo PrismaService để quản lý kết nối DB**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- [ ] **Step 2: Tạo PrismaModule để export PrismaService**
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Cấu hình ValidationPipe toàn cục trong main.ts**
```typescript
// Thêm vào bootstrap()
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

- [ ] **Step 4: Commit**
```bash
git add apps/api/src/prisma
git commit -m "feat: setup prisma service and global validation pipe"
```

---

### Task 2: Category Management API

**Files:**
- Create: `apps/api/src/catalog/category.controller.ts`
- Create: `apps/api/src/catalog/category.service.ts`
- Create: `apps/api/src/catalog/catalog.module.ts`

- [ ] **Step 1: Viết test cho CategoryService (CRUD)**
- [ ] **Step 2: Triển khai CategoryService (findAll, create, update, delete)**
- [ ] **Step 3: Triển khai CategoryController**
- [ ] **Step 4: Commit**
```bash
git add apps/api/src/catalog
git commit -m "feat: implement category management api"
```

---

### Task 3: Product Management API

**Files:**
- Create: `apps/api/src/catalog/product.controller.ts`
- Create: `apps/api/src/catalog/product.service.ts`
- Modify: `apps/api/src/catalog/catalog.module.ts`

- [ ] **Step 1: Viết test cho ProductService (Tạo sản phẩm với Zod validation)**
- [ ] **Step 2: Triển khai ProductService (Search, GetById, Create, Update, Delete)**
- [ ] **Step 3: Triển khai ProductController (tích hợp shared validation schema)**
- [ ] **Step 4: Commit**
```bash
git add apps/api/src/catalog
git commit -m "feat: implement product management api"
```

---

### Task 4: Order Submission API (Guest Checkout)

**Files:**
- Create: `apps/api/src/orders/orders.controller.ts`
- Create: `apps/api/src/orders/orders.service.ts`
- Create: `apps/api/src/orders/orders.module.ts`

- [ ] **Step 1: Viết test cho Order submission (trừ tồn kho, tạo bản ghi Order & OrderItem)**
- [ ] **Step 2: Triển khai OrderService.create() với Prisma Transaction**
- [ ] **Step 3: Triển khai OrdersController.create()**
- [ ] **Step 4: Commit**
```bash
git add apps/api/src/orders
git commit -m "feat: implement guest checkout order submission api"
```

---

### Task 5: Order Management API (Admin)

- [ ] **Step 1: Triển khai API lấy danh sách đơn hàng (Phân trang, Lọc theo trạng thái)**
- [ ] **Step 2: Triển khai API cập nhật trạng thái đơn hàng (PENDING -> SHIPPING -> SUCCESS)**
- [ ] **Step 3: Commit**
```bash
git add apps/api/src/orders
git commit -m "feat: implement admin order management api"
```
