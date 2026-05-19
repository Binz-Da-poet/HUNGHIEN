# Order Submission API (Guest Checkout) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a guest checkout API that handles order submission, validates stock, and updates inventory in a transaction.

**Architecture:** NestJS Module with Controller and Service. Service uses Prisma $transaction to ensure atomicity between order creation and stock updates.

**Tech Stack:** NestJS, Prisma, Vitest, class-validator.

---

### Task 1: Scaffolding and DTOs

**Files:**
- Create: `apps/api/src/orders/dto/create-order.dto.ts`
- Create: `apps/api/src/orders/orders.service.ts`
- Create: `apps/api/src/orders/orders.controller.ts`
- Create: `apps/api/src/orders/orders.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create CreateOrderDto**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
```

- [ ] **Step 2: Create OrdersService Skeleton**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // To be implemented
  }
}
```

- [ ] **Step 3: Create OrdersController Skeleton**

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
}
```

- [ ] **Step 4: Create OrdersModule**

```typescript
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

- [ ] **Step 5: Register OrdersModule in AppModule**

- [ ] **Step 6: Commit**
```bash
git add apps/api/src/orders apps/api/src/app.module.ts
git commit -m "chore: scaffold orders module and create dtos"
```

---

### Task 2: TDD for OrdersService.create()

**Files:**
- Create: `apps/api/src/orders/orders.service.spec.ts`
- Modify: `apps/api/src/orders/orders.service.ts`

- [ ] **Step 1: Write failing tests for OrdersService.create()**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: vi.fn(),
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    order: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createOrderDto = {
      customerName: 'John Doe',
      phone: '0123456789',
      address: '123 Street',
      paymentMethod: 'COD',
      items: [
        { productId: 'prod1', quantity: 2 },
      ],
    };

    it('should create an order and update stock successfully', async () => {
      const product = { id: 'prod1', price: 100, stock: 10 };
      const createdOrder = { id: 'order1', ...createOrderDto, totalAmount: 200 };

      // Mock transaction behavior
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      mockPrismaService.product.findUnique.mockResolvedValue(product);
      mockPrismaService.order.create.mockResolvedValue(createdOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(createdOrder);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod1' },
        data: { stock: { decrement: 2 } },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1', stock: 1, price: 100 });

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
    });
  });
});
```

- [ ] **Step 2: Run tests and verify failure**
Run: `pnpm -F api test`
Expected: Tests fail (method not implemented or returning undefined).

- [ ] **Step 3: Implement OrdersService.create() with Transaction**

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        const priceAtPurchase = Number(product.price);
        totalAmount += priceAtPurchase * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase,
        });
      }

      const order = await tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          phone: createOrderDto.phone,
          address: createOrderDto.address,
          note: createOrderDto.note,
          paymentMethod: createOrderDto.paymentMethod,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }
}
```

- [ ] **Step 4: Run tests and verify success**
Run: `pnpm -F api test`
Expected: All tests pass.

- [ ] **Step 5: Commit**
```bash
git add apps/api/src/orders/orders.service.ts apps/api/src/orders/orders.service.spec.ts
git commit -m "feat: implement OrdersService.create with prisma transaction and stock validation"
```

---

### Task 3: Finalize Controller and Verification

**Files:**
- Modify: `apps/api/src/main.ts` (Ensure ValidationPipe is enabled if not already)
- Modify: `apps/api/src/orders/orders.controller.ts`

- [ ] **Step 1: Check main.ts for ValidationPipe**

- [ ] **Step 2: Run all tests to ensure no regressions**
Run: `pnpm -F api test`

- [ ] **Step 3: Commit and Finish**
```bash
git add apps/api/src/main.ts
git commit -m "feat: ensure global validation pipe and final checkout"
```
