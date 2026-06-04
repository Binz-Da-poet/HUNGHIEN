# VND Currency Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all monetary values as whole-number VND across validation, admin forms with live previews, and admin/storefront display using `formatVnd()`.

**Architecture:** Keep Prisma `Decimal` money columns unchanged and treat stored values as integer VND. Tighten shared Zod schemas and NestJS DTO validation to integers, then replace all `$` + `.toFixed(2)` UI formatting with `formatVnd()` through app-level format re-exports.

**Tech Stack:** Turborepo, pnpm, `@repo/shared`, NestJS class-validator, Next.js 14, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-04-vnd-currency-design.md`

---

## File Structure And Responsibilities

- `packages/shared/src/schemas/product.ts`: integer VND validation for `price` and `originalPrice`.
- `packages/shared/src/schemas/product.test.ts`: tests for integer-only product prices.
- `apps/api/src/catalog/dto/create-product.dto.ts`: `@IsInt()` / `@Min(1)` for money fields.
- `apps/admin/lib/format.ts`: re-export `formatVnd` (already exists).
- `apps/admin/components/products/product-form.tsx`: VND labels, integer inputs, live previews.
- `apps/admin/components/products/product-table.tsx`: VND display in table.
- `apps/admin/components/orders/order-list.tsx`: VND display for order totals.
- `apps/storefront/lib/format.ts`: re-export `formatVnd`.
- `apps/storefront/components/product-card.tsx`: VND price display.
- `apps/storefront/app/products/[id]/page.tsx`: VND price display.
- `apps/storefront/app/cart/page.tsx`: VND totals.
- `apps/storefront/app/checkout/page.tsx`: VND totals.

---

### Task 1: Shared Integer VND Validation

**Files:**
- Modify: `packages/shared/src/schemas/product.ts`
- Modify: `packages/shared/src/schemas/product.test.ts`

- [ ] **Step 1: Add failing tests for integer VND prices**

Append to `packages/shared/src/schemas/product.test.ts`:

```ts
it('should reject decimal prices', () => {
  const result = CreateProductSchema.safeParse({
    name: 'Test',
    slug: 'test',
    price: 99.5,
    brand: 'Brand',
    stock: 1,
    categoryId: 'cat-1',
  });

  expect(result.success).toBe(false);
});

it('should accept whole-number VND prices', () => {
  const result = CreateProductSchema.safeParse({
    name: 'Test',
    slug: 'test',
    price: 22990000,
    originalPrice: 24990000,
    brand: 'Brand',
    stock: 1,
    categoryId: 'cat-1',
  });

  expect(result.success).toBe(true);
});
```

- [ ] **Step 2: Run shared tests and verify failure**

Run: `pnpm --filter @repo/shared test`

Expected: FAIL on decimal price acceptance.

- [ ] **Step 3: Update product schema to integer VND**

In `packages/shared/src/schemas/product.ts`:

```ts
price: z.number().int().positive(),
originalPrice: z.number().int().positive().optional(),
```

- [ ] **Step 4: Run shared tests**

Run: `pnpm --filter @repo/shared test`

Expected: PASS.

- [ ] **Step 5: Commit shared VND validation**

```bash
git add packages/shared/src/schemas/product.ts packages/shared/src/schemas/product.test.ts
git commit -m "feat: validate product prices as integer VND"
```

---

### Task 2: API DTO Integer Validation

**Files:**
- Modify: `apps/api/src/catalog/dto/create-product.dto.ts`

- [ ] **Step 1: Require integer VND in create DTO**

Update imports and fields:

```ts
import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

@IsInt()
@Min(1)
price: number;

@IsOptional()
@IsInt()
@Min(1)
originalPrice?: number;
```

Remove `@IsNumber()` from money fields.

- [ ] **Step 2: Run API tests**

Run: `pnpm --filter api test`

Expected: PASS.

- [ ] **Step 3: Commit API DTO validation**

```bash
git add apps/api/src/catalog/dto/create-product.dto.ts
git commit -m "feat: validate product DTO prices as integer VND"
```

---

### Task 3: Admin Form Preview And List Formatting

**Files:**
- Modify: `apps/admin/components/products/product-form.tsx`
- Modify: `apps/admin/components/products/product-table.tsx`
- Modify: `apps/admin/components/orders/order-list.tsx`

- [ ] **Step 1: Add VND labels, integer inputs, and previews to product form**

Import:

```ts
import { formatVnd } from '@/lib/format';
```

Update price labels to `Giá (VND)` and `Giá gốc (VND)`.

Set inputs:

```tsx
step="1"
min="1"
```

Render previews:

```tsx
<p className="text-xs text-slate-500">Hiển thị: {formatVnd(formData.price)}</p>
```

and for original price when value is present.

Add helper text: `Nhập số nguyên, không dấu chấm`.

- [ ] **Step 2: Replace admin table and order list `$` formatting**

In `product-table.tsx`:

```tsx
import { formatVnd } from '@/lib/format';
// ...
{formatVnd(product.price)}
```

In `order-list.tsx`:

```tsx
import { formatVnd } from '@/lib/format';
// ...
{formatVnd(order.totalAmount)}
```

- [ ] **Step 3: Verify admin build**

Run: `pnpm --filter admin build`

Expected: PASS.

- [ ] **Step 4: Commit admin VND formatting**

```bash
git add apps/admin/components/products/product-form.tsx apps/admin/components/products/product-table.tsx apps/admin/components/orders/order-list.tsx
git commit -m "feat: format admin prices as VND"
```

---

### Task 4: Storefront VND Formatting

**Files:**
- Create: `apps/storefront/lib/format.ts`
- Modify: `apps/storefront/components/product-card.tsx`
- Modify: `apps/storefront/app/products/[id]/page.tsx`
- Modify: `apps/storefront/app/cart/page.tsx`
- Modify: `apps/storefront/app/checkout/page.tsx`

- [ ] **Step 1: Add storefront format helper**

Create `apps/storefront/lib/format.ts`:

```ts
export { formatVnd } from '@repo/shared';
```

Ensure `@repo/shared` is in `apps/storefront/package.json` dependencies if missing.

- [ ] **Step 2: Replace storefront `$` formatting**

Use `formatVnd()` for:

- product card price and original price
- product detail price and original price
- cart line totals and summary totals
- checkout line totals and summary totals

For line totals multiply first, then format:

```tsx
formatVnd(item.price * item.quantity)
```

- [ ] **Step 3: Verify storefront build**

Run: `pnpm --filter storefront build`

Expected: PASS.

- [ ] **Step 4: Commit storefront VND formatting**

```bash
git add apps/storefront/lib/format.ts apps/storefront/package.json pnpm-lock.yaml apps/storefront/components/product-card.tsx apps/storefront/app/products/[id]/page.tsx apps/storefront/app/cart/page.tsx apps/storefront/app/checkout/page.tsx
git commit -m "feat: format storefront prices as VND"
```

---

### Task 5: Manual VND QA

**Files:**
- Modify only if verification finds a missed `$` display.

- [ ] **Step 1: Run package checks**

Run: `pnpm --filter @repo/shared test`

Expected: PASS.

Run: `pnpm --filter api test`

Expected: PASS.

- [ ] **Step 2: Verify admin manually**

Open `http://localhost:3002/products/new`.

Check:

- typing `22990000` shows preview `22.990.000₫`
- product list shows VND, not `$`
- orders list shows VND totals

- [ ] **Step 3: Verify storefront manually**

Open `http://localhost:3000`.

Check:

- home product cards show VND
- product detail, cart, checkout totals show VND
- no `.00` USD-style decimals on prices

- [ ] **Step 4: Fix any remaining `$` displays in owning file**

Search:

```bash
rg "\$\{|toFixed\(2\)" apps/admin apps/storefront
```

Expected: no price-display matches remain.

---

## Plan Self-Review

- Spec coverage: DB convention, shared validation, API DTOs, admin form preview, admin lists, storefront display, verification, and out-of-scope items are covered.
- Scope control: no currency column, no dotted-input parser, no Decimal-to-Int migration.
- Consistency: all display paths use `formatVnd()`; all create/update validation requires integer VND.
