# Phase 2 Orders, Payments, and Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện luồng đặt hàng không cần tài khoản, giảm/hoàn tồn kho chính xác, trạng thái giao hàng và thanh toán tách biệt, chuyển khoản thủ công và tra cứu đơn.

**Architecture:** `OrdersModule` sở hữu checkout, trạng thái giao hàng, tracking và stock restoration. `PaymentsModule` sở hữu chuyển trạng thái thanh toán. Mọi thay đổi quan trọng chạy trong Prisma transaction và ghi `OrderEvent`; storefront chỉ nhận public order summary.

**Tech Stack:** NestJS 10, Prisma 5/PostgreSQL, Next.js 14 App Router, Zustand 4.5, Vitest 4.1.

---

## File Map

**Create**

- `packages/shared/src/schemas/order.ts`
- `packages/shared/src/schemas/order.test.ts`
- `apps/api/src/orders/order-code.ts`
- `apps/api/src/orders/order-code.spec.ts`
- `apps/api/src/orders/order-transitions.ts`
- `apps/api/src/orders/order-transitions.spec.ts`
- `apps/api/src/orders/dto/track-order.dto.ts`
- `apps/api/src/orders/dto/update-payment-status.dto.ts`
- `apps/api/src/orders/dto/admin-order-query.dto.ts`
- `apps/api/src/payments/payments.module.ts`
- `apps/api/src/payments/payments.controller.ts`
- `apps/api/src/payments/payments.service.ts`
- `apps/api/src/payments/payments.service.spec.ts`
- `apps/storefront/lib/orders.ts`
- `apps/storefront/components/order-status.tsx`
- `apps/storefront/app/orders/tracking/page.tsx`
- `apps/storefront/app/orders/tracking/tracking-form.tsx`
- `apps/storefront/vitest.config.ts`
- `apps/storefront/test/setup.ts`
- `apps/storefront/store/use-cart.spec.ts`
- `apps/admin/components/orders/order-detail.tsx`
- `apps/admin/components/orders/payment-status-badge.tsx`

**Modify**

- `packages/shared/index.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/app.module.ts`
- `apps/api/src/orders/orders.module.ts`
- `apps/api/src/orders/orders.controller.ts`
- `apps/api/src/orders/orders.service.ts`
- `apps/api/src/orders/orders.service.spec.ts`
- `apps/api/src/orders/dto/create-order.dto.ts`
- `apps/api/src/orders/dto/order-query.dto.ts`
- `apps/api/src/orders/dto/update-order-status.dto.ts`
- `apps/api/src/homepage/dto/homepage.dto.ts`
- `apps/api/src/homepage/homepage.service.ts`
- `apps/storefront/store/use-cart.ts`
- `apps/storefront/package.json`
- `apps/storefront/app/checkout/page.tsx`
- `apps/storefront/app/checkout/success/page.tsx`
- `apps/storefront/components/site-header.tsx`
- `apps/admin/app/orders/page.tsx`
- `apps/admin/components/orders/order-list.tsx`
- `apps/admin/components/orders/order-status-badge.tsx`
- `apps/admin/components/cms/store-settings-form.tsx`

---

### Task 1: Add shared order contracts and the order/payment data model

**Files:**
- Create: `packages/shared/src/schemas/order.ts`
- Create: `packages/shared/src/schemas/order.test.ts`
- Modify: `packages/shared/index.ts`
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Write failing shared contract tests**

Test:

```ts
expect(CreateOrderSchema.parse(validOrder).items).toHaveLength(1);
expect(() => CreateOrderSchema.parse({ ...validOrder, paymentMethod: 'CARD' })).toThrow();
expect(() => CreateOrderSchema.parse({ ...validOrder, items: [] })).toThrow();
expect(() => CreateOrderSchema.parse(orderWithMoreThan50Items)).toThrow();
```

The schema must accept only `COD` and `BANK_TRANSFER`, quantities `1..99`, at most `50` lines, Vietnamese phone input, and UUID `checkoutAttemptId`.

- [ ] **Step 2: Run the shared tests and confirm failure**

Run:

```bash
pnpm --filter @repo/shared test
```

Expected: FAIL because order contracts do not exist.

- [ ] **Step 3: Add Prisma enums and order fields**

Add:

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  COD
  BANK_TRANSFER
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}

enum OrderEventType {
  ORDER_STATUS_CHANGED
  PAYMENT_STATUS_CHANGED
  STOCK_RESTORED
}
```

Add to `Order`:

```prisma
publicCode         String        @unique
checkoutAttemptId  String?       @unique
checkoutAttemptExpiresAt DateTime?
phoneNormalized    String
paymentMethod      PaymentMethod
status             OrderStatus   @default(PENDING)
paymentStatus      PaymentStatus @default(UNPAID)
stockRestoredAt    DateTime?
updatedAt          DateTime      @updatedAt
events             OrderEvent[]
```

Make `checkoutAttemptId` nullable so expired keys can be cleared while preserving the order. Add an index on `phoneNormalized`. Add `productName String` to `OrderItem`. Add `OrderEvent` with `type`, `fromValue`, `toValue`, optional `adminId`, relation to `AdminUser`, and `createdAt`.

- [ ] **Step 4: Add bank transfer settings fields**

Extend `StoreSettings`:

```prisma
bankName                String?
bankAccountNumber       String?
bankAccountHolder       String?
bankQrImageUrl          String?
bankTransferTemplate    String?
bankTransferInstructions String?
```

- [ ] **Step 5: Backfill legacy orders in the migration**

Before adding enum/non-null/unique constraints, the SQL migration must add new enum columns, backfill them, then drop/rename the old string columns. It must also backfill legacy order identifiers:

```sql
UPDATE "Order"
SET
  "publicCode" = 'LEGACY' || upper(substr(md5("id"), 1, 10)),
  "checkoutAttemptId" = 'legacy-' || "id",
  "checkoutAttemptExpiresAt" = NOW() - INTERVAL '1 day',
  "phoneNormalized" = CASE
    WHEN regexp_replace("phone", '[^0-9]', '', 'g') LIKE '84%'
      THEN '0' || substr(regexp_replace("phone", '[^0-9]', '', 'g'), 3)
    ELSE regexp_replace("phone", '[^0-9]', '', 'g')
  END;

UPDATE "OrderItem" oi
SET "productName" = p."name"
FROM "Product" p
WHERE oi."productId" = p."id";
```

Copy old status/payment strings into new enum columns with `CASE WHEN "status" = 'SUCCESS' THEN 'COMPLETED' ...`, then drop/rename old columns. Keep `checkoutAttemptId` nullable with a unique index. Verify row counts before and after migration.

- [ ] **Step 6: Create and verify migration**

Run:

```bash
pnpm --filter api exec prisma migrate dev --name order_payment_inventory
pnpm --filter api exec prisma validate
pnpm --filter @repo/shared test
```

Commit:

```bash
git add packages/shared apps/api/prisma
git commit -m "feat(orders): add order and payment domain model"
```

---

### Task 2: Implement idempotent checkout and atomic inventory

**Files:**
- Create: `apps/api/src/orders/order-code.ts`
- Create: `apps/api/src/orders/order-code.spec.ts`
- Modify: `apps/api/src/orders/dto/create-order.dto.ts`
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/api/src/orders/orders.service.spec.ts`
- Modify: `apps/api/src/orders/orders.controller.ts`

- [ ] **Step 1: Write failing checkout tests**

Add tests proving:

```ts
it('returns the existing order for a repeated checkoutAttemptId');
it('returns the existing order only while checkoutAttemptId has not expired');
it('clears expired checkout attempt keys after a successful new order');
it('merges duplicate product lines before reserving stock');
it('uses database product price and name snapshots');
it('rejects inactive products');
it('rolls back all stock changes when one item is unavailable');
it('uses updateMany with stock gte quantity to prevent overselling');
```

Mock the conditional decrement result:

```ts
tx.product.updateMany.mockResolvedValue({ count: 0 });
await expect(service.create(dto)).rejects.toThrow(BadRequestException);
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
pnpm --filter api test -- order-code.spec.ts orders.service.spec.ts
```

Expected: FAIL for idempotency, line merging, and conditional stock decrement.

- [ ] **Step 3: Implement public order code generation**

`createPublicOrderCode()` returns `HH` plus ten uppercase hexadecimal characters from `randomBytes(5)`. Keep the DB unique constraint as the final collision guard.

- [ ] **Step 4: Implement checkout transaction**

Inside one Prisma transaction:

1. Return the existing order when `checkoutAttemptId` exists and `checkoutAttemptExpiresAt > now`.
2. Clear the key when it exists but has expired.
3. Merge repeated product IDs and sum quantities.
4. Load all products with `status: ACTIVE`.
5. Reject missing/inactive products.
6. For each merged item, run:

```ts
const reserved = await tx.product.updateMany({
  where: { id: product.id, status: 'ACTIVE', stock: { gte: quantity } },
  data: { stock: { decrement: quantity } },
});
if (reserved.count !== 1) throw new BadRequestException('Sản phẩm không đủ tồn kho.');
```

7. Create the order with server-calculated total, item snapshots, and `checkoutAttemptExpiresAt = now + 24 hours`.
8. After the new order succeeds, clear other expired checkout keys with `updateMany`.

Store `phoneNormalized = normalizeVietnamesePhone(dto.phone)` while preserving the original display phone. The helper strips separators and converts a leading `84` country code to a leading `0`, so `+84 912...` and `0912...` match the same order.

- [ ] **Step 5: Rate-limit checkout and return public summary**

Apply a stricter order creation throttle. The response must contain `publicCode`, status, payment status, payment method, item snapshots, total, and transfer settings only when applicable; do not expose internal event/admin data.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm --filter api test -- orders.service.spec.ts orders.controller.spec.ts
pnpm --filter api build
```

Commit:

```bash
git add apps/api/src/orders
git commit -m "feat(orders): add idempotent atomic checkout"
```

---

### Task 3: Enforce order transitions, restore stock once, and manage payment status

**Files:**
- Create: `apps/api/src/orders/order-transitions.ts`
- Create: `apps/api/src/orders/order-transitions.spec.ts`
- Create: `apps/api/src/orders/dto/update-payment-status.dto.ts`
- Create: `apps/api/src/payments/payments.module.ts`
- Create: `apps/api/src/payments/payments.controller.ts`
- Create: `apps/api/src/payments/payments.service.ts`
- Create: `apps/api/src/payments/payments.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/api/src/orders/orders.service.spec.ts`
- Modify: `apps/api/src/orders/orders.controller.ts`
- Modify: `apps/api/src/orders/dto/update-order-status.dto.ts`

- [ ] **Step 1: Write failing transition tests**

Use explicit transition tables:

```ts
PENDING: ['CONFIRMED', 'CANCELLED']
CONFIRMED: ['SHIPPING', 'CANCELLED']
SHIPPING: ['COMPLETED']
COMPLETED: []
CANCELLED: []
```

Payment transitions:

```ts
UNPAID: ['PAID']
PAID: ['REFUNDED']
REFUNDED: []
```

Test invalid transitions, stock restoration, repeated cancellation, event creation, and admin ID capture.

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
pnpm --filter api test -- order-transitions.spec.ts orders.service.spec.ts payments.service.spec.ts
```

- [ ] **Step 3: Implement shipping-status transitions**

`OrdersService.updateStatus(id, dto, adminId)` must:

- load order with items;
- validate the transition;
- on first cancellation, increment each product stock and set `stockRestoredAt`;
- create `OrderEvent`;
- update status in the same transaction.

Never restore stock when `stockRestoredAt` already exists.

- [ ] **Step 4: Implement payment transitions in `PaymentsModule`**

Expose guarded endpoint:

```text
PATCH /api/admin/orders/:id/payment-status
```

`PaymentsService` validates transition, updates payment status, and creates `OrderEvent`. Cancelling a paid order does not automatically refund it.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter api test
pnpm --filter api build
```

Commit:

```bash
git add apps/api/src/orders apps/api/src/payments apps/api/src/app.module.ts
git commit -m "feat(orders): enforce order and payment transitions"
```

---

### Task 4: Add secure public order tracking

**Files:**
- Create: `apps/api/src/orders/dto/track-order.dto.ts`
- Create: `apps/storefront/lib/orders.ts`
- Create: `apps/storefront/components/order-status.tsx`
- Create: `apps/storefront/app/orders/tracking/page.tsx`
- Create: `apps/storefront/app/orders/tracking/tracking-form.tsx`
- Modify: `apps/api/src/orders/orders.controller.ts`
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/api/src/orders/orders.service.spec.ts`
- Modify: `apps/storefront/components/site-header.tsx`

- [ ] **Step 1: Write failing tracking service tests**

Test:

```ts
it('requires both publicCode and phone');
it('returns a public summary for a matching code and phone');
it('returns the same not-found response for a wrong phone or unknown code');
it('does not include internal id, events, or admin data');
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
pnpm --filter api test -- orders.service.spec.ts orders.controller.spec.ts
```

- [ ] **Step 3: Implement the tracking endpoint**

Expose rate-limited:

```text
POST /api/orders/tracking
```

Normalize phone input before matching. Return `404` with the same Vietnamese message for every mismatch.

- [ ] **Step 4: Build the tracking page**

The client form submits code + phone, displays order/payment badges, item snapshots, total, and bank transfer instructions when the order is unpaid bank transfer. Replace existing header tracking link with the working route.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter api test
pnpm --filter storefront build
```

Commit:

```bash
git add apps/api/src/orders apps/storefront
git commit -m "feat(storefront): add secure order tracking"
```

---

### Task 5: Complete checkout and transfer-success UX

**Files:**
- Create: `apps/storefront/vitest.config.ts`
- Create: `apps/storefront/test/setup.ts`
- Create: `apps/storefront/store/use-cart.spec.ts`
- Modify: `apps/storefront/package.json`
- Modify: `apps/storefront/store/use-cart.ts`
- Modify: `apps/storefront/app/checkout/page.tsx`
- Modify: `apps/storefront/app/checkout/success/page.tsx`
- Modify: `apps/admin/components/cms/store-settings-form.tsx`
- Modify: `apps/api/src/homepage/dto/homepage.dto.ts`
- Modify: `apps/api/src/homepage/homepage.service.ts`

- [ ] **Step 1: Add failing cart/checkout store tests**

Install and configure the test runner first:

```bash
pnpm --filter storefront add -D vitest@4.1.6 jsdom @testing-library/react @testing-library/jest-dom
```

Add `"test": "vitest run"` to `apps/storefront/package.json` and configure jsdom plus `@testing-library/jest-dom` setup.

Test that the store:

```ts
it('creates one checkoutAttemptId per checkout attempt');
it('keeps the same attempt id when submit is retried');
it('stores the last public order summary for the success page');
it('clears the attempt only after success or explicit reset');
```

- [ ] **Step 2: Add bank fields to settings API/admin**

Extend settings DTO and admin form with bank name, account number, holder, QR upload, transfer template, and instructions. Validate required bank fields when bank transfer is offered.

- [ ] **Step 3: Submit checkout with idempotency and store the response**

Send `checkoutAttemptId` with checkout. Disable duplicate submits. On success, save `lastOrderSummary`, clear the relevant cart/buy-now item, and navigate to `/checkout/success`.

- [ ] **Step 4: Render COD and bank-transfer success states**

- COD: confirmation, public code, tracking link.
- Bank transfer: public code, QR, account information, generated transfer content, unpaid badge, tracking link.
- No last summary: show a recovery state linking to order tracking.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter storefront test
pnpm --filter storefront build
pnpm --filter admin build
```

Commit:

```bash
git add apps/storefront apps/admin/components/cms/store-settings-form.tsx apps/api/src/homepage
git commit -m "feat(checkout): complete COD and bank transfer flow"
```

---

### Task 6: Complete admin order operations

**Files:**
- Create: `apps/admin/components/orders/order-detail.tsx`
- Create: `apps/admin/components/orders/payment-status-badge.tsx`
- Create: `apps/api/src/orders/dto/admin-order-query.dto.ts`
- Modify: `apps/api/src/orders/orders.controller.ts`
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/admin/app/orders/page.tsx`
- Modify: `apps/admin/components/orders/order-list.tsx`
- Modify: `apps/admin/components/orders/order-status-badge.tsx`

- [ ] **Step 1: Write failing admin order query tests**

Cover pagination, search by public code/name/phone, order status filter, payment status filter, and detail response with item snapshots/events.

- [ ] **Step 2: Add guarded admin order endpoints**

Expose:

```text
GET /api/admin/orders
GET /api/admin/orders/:id
PATCH /api/admin/orders/:id/status
PATCH /api/admin/orders/:id/payment-status
```

Keep public checkout/tracking under `/api/orders`.

- [ ] **Step 3: Build the admin order list/detail UI**

Use `adminFetch`. Show public code, customer, total, shipping status, payment status, payment method, and detail panel. Only render valid next transitions. Confirm cancellation/refund actions before request.

- [ ] **Step 4: Verify Phase 2**

Run:

```bash
pnpm lint
pnpm --filter @repo/shared test
pnpm --filter api test
pnpm build
git diff --check
```

Manual verification:

1. Place a COD order and track it.
2. Place a bank transfer order and see QR/instructions.
3. Retry the same checkout request and confirm only one order exists.
4. Cancel an order twice and confirm stock restores once.
5. Confirm payment and verify admin UI/event history.

Commit:

```bash
git add apps/api/src/orders apps/api/src/payments apps/admin
git commit -m "feat(admin): complete order and payment operations"
```
