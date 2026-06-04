# Order Management API (Admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement admin APIs for listing and updating order statuses.

**Architecture:** Extend `OrdersService` and `OrdersController` with new methods. Use DTOs for query parameters and update requests.

**Tech Stack:** NestJS, Prisma, TypeScript.

---

### Task 1: Create DTOs for Order Management

**Files:**
- Create: `apps/api/src/orders/dto/order-query.dto.ts`
- Create: `apps/api/src/orders/dto/update-order-status.dto.ts`

- [ ] **Step 1: Create OrderQueryDto**
```typescript
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number;
}
```

- [ ] **Step 2: Create UpdateOrderStatusDto**
```typescript
import { IsString, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsEnum(['PENDING', 'SHIPPING', 'SUCCESS', 'CANCELLED'])
  status: string;
}
```

- [ ] **Step 3: Commit**
```bash
git add apps/api/src/orders/dto
git commit -m "feat: add order query and update status dtos"
```

### Task 2: Implement findAll in OrdersService with TDD

**Files:**
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/api/src/orders/orders.service.spec.ts`

- [ ] **Step 1: Write failing test for findAll**
In `apps/api/src/orders/orders.service.spec.ts`:
```typescript
it('should find all orders with pagination and filter', async () => {
  const query = { status: 'PENDING', skip: 0, take: 10 };
  const mockOrders = [{ id: '1', status: 'PENDING' }];
  (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

  const result = await service.findAll(query);

  expect(prisma.order.findMany).toHaveBeenCalledWith({
    where: { status: 'PENDING' },
    skip: 0,
    take: 10,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  expect(result).toEqual(mockOrders);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test apps/api/src/orders/orders.service.spec.ts`
Expected: FAIL (findAll is not a function)

- [ ] **Step 3: Implement findAll in OrdersService**
```typescript
async findAll(query: OrderQueryDto) {
  const { status, skip = 0, take = 10 } = query;
  return this.prisma.order.findMany({
    where: status ? { status } : {},
    skip,
    take,
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test apps/api/src/orders/orders.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add apps/api/src/orders/orders.service.ts apps/api/src/orders/orders.service.spec.ts
git commit -m "feat: implement findAll in OrdersService"
```

### Task 3: Implement updateStatus in OrdersService with TDD

**Files:**
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/api/src/orders/orders.service.spec.ts`

- [ ] **Step 1: Write failing test for updateStatus**
In `apps/api/src/orders/orders.service.spec.ts`:
```typescript
it('should update order status', async () => {
  const id = 'order-id';
  const updateDto = { status: 'SHIPPING' };
  const mockOrder = { id, status: 'SHIPPING' };
  
  (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id, status: 'PENDING' });
  (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);

  const result = await service.updateStatus(id, updateDto);

  expect(prisma.order.update).toHaveBeenCalledWith({
    where: { id },
    data: { status: 'SHIPPING' },
  });
  expect(result).toEqual(mockOrder);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test apps/api/src/orders/orders.service.spec.ts`
Expected: FAIL (updateStatus is not a function)

- [ ] **Step 3: Implement updateStatus in OrdersService**
```typescript
async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
  const order = await this.prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new NotFoundException(`Order with ID ${id} not found`);
  }

  return this.prisma.order.update({
    where: { id },
    data: {
      status: updateOrderStatusDto.status,
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test apps/api/src/orders/orders.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add apps/api/src/orders/orders.service.ts apps/api/src/orders/orders.service.spec.ts
git commit -m "feat: implement updateStatus in OrdersService"
```

### Task 4: Update OrdersController

**Files:**
- Modify: `apps/api/src/orders/orders.controller.ts`

- [ ] **Step 1: Add GET and PATCH endpoints to OrdersController**
```typescript
  @Get()
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
```

- [ ] **Step 2: Verify overall implementation**
Run all tests: `npm run test apps/api/src/orders`

- [ ] **Step 3: Commit**
```bash
git add apps/api/src/orders/orders.controller.ts
git commit -m "feat: add admin endpoints to OrdersController"
```
