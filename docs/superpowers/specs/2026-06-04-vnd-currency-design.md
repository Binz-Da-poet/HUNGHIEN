# VND Currency Standardization - Design Specification

## 1. Goal

Standardize HUNG HIEN so all monetary values are treated and displayed as Vietnamese dong (VND). Remove USD-style formatting (`$`, two decimal places) from admin and storefront UI, and make admin product forms clearly accept whole-number VND amounts with live formatted previews.

## 2. Chosen Approach

Use a **storage convention plus shared formatting** approach.

- Keep existing Prisma `Decimal` columns for money fields.
- Treat every stored amount as a whole-number VND value in đồng.
- Display all prices with the existing shared `formatVnd()` helper.
- Validate integer VND amounts in shared schemas, API DTOs, and admin forms.
- Do not add a `currency` column or multi-currency support in this pass.

This was selected over:

- **Adding a `currency` column** — unnecessary for a single-currency shop.
- **Parsing dotted input such as `22.990.000`** — more complex and deferred.

Admin input uses raw integers (`22990000`) with a live preview (`22.990.000₫`).

## 3. Current Problems

- Storefront and admin UI render prices with `$` and `.toFixed(2)`.
- Admin product forms do not indicate that values are VND integers.
- Shared `formatVnd()` exists but is not used consistently in UI surfaces.
- Validation allows non-integer positive numbers, which is misleading for VND.

## 4. Data Convention

### Database

No schema migration is required.

Money fields remain:

- `Product.price`
- `Product.originalPrice`
- `Order.totalAmount`
- `OrderItem.priceAtPurchase`

**Rule:** all values are whole-number VND amounts stored in existing `Decimal` columns.

Existing seed data already follows this convention (for example `22990000`, `390000`).

### API

- Responses continue returning numeric/string decimal values from Prisma.
- Clients format display values with `formatVnd()`.
- Create/update product validation requires integer VND:
  - `price`: integer, minimum `1`
  - `originalPrice`: optional integer, minimum `1` when provided

Order totals remain computed server-side from product prices at purchase time.

## 5. Shared Validation And Formatting

### Existing

- `packages/shared/src/format/currency.ts` — `formatVnd()`

### Updates

- `CreateProductSchema` in `packages/shared/src/schemas/product.ts`:
  - `price`: `z.number().int().positive()`
  - `originalPrice`: `z.number().int().positive().optional()`

Add tests for integer-only acceptance and rejection of decimal prices.

Optional helper (only if needed by forms):

- `isValidVndAmount(value)` — finite integer ≥ 1

No dotted-input parser in this pass.

## 6. Admin UX

### Product Form

Update labels and inputs:

- `Giá (VND)`
- `Giá gốc (VND)`

Input rules:

- `type="number"`
- `step="1"`
- `min="1"`

Below each price field, show live preview:

- `{formatVnd(formData.price)}`
- `{formatVnd(formData.originalPrice)}` when value is present

Helper text: `Nhập số nguyên, không dấu chấm`.

### Admin Lists

Replace all `$` + `.toFixed(2)` usage with `formatVnd()` in:

- Product table and future mobile product cards
- Order list and future mobile order cards

Import through `apps/admin/lib/format.ts`.

## 7. Storefront UX

Replace all `$` + `.toFixed(2)` usage with `formatVnd()` in:

- Product cards
- Product detail page
- Cart line totals and order summary
- Checkout line totals and order summary

Import through `apps/storefront/lib/format.ts`.

Cart store (`use-cart.ts`) keeps numeric VND values; only display formatting changes.

## 8. API DTO Validation

Update `CreateProductDto` and `UpdateProductDto` usage:

- `@IsInt()` and `@Min(1)` for `price`
- `@IsOptional()`, `@IsInt()`, `@Min(1)` for `originalPrice`

Ensure product service tests cover integer validation behavior through shared schema and DTO paths where applicable.

## 9. Out Of Scope

- Currency column on products or orders
- Multi-currency support or exchange rates
- Parsing dotted VND input (`22.990.000`) in forms
- Changing Prisma money columns from `Decimal` to `Int` or `BigInt`
- Invoice/email/PDF formatting
- Forcing business rule `originalPrice > price` (only integer positivity in this pass)

## 10. Verification

### Automated

- `pnpm --filter @repo/shared test` — PASS
- `pnpm --filter api test` — PASS where product validation is affected
- `pnpm --filter admin build` — PASS
- `pnpm --filter storefront build` — PASS

### Manual

- Product card/detail show `22.990.000₫`, not `$22990000.00`
- Cart and checkout totals use VND formatting
- Admin product form preview updates while typing `22990000`
- Saved product appears with VND formatting in admin list
- Order list shows VND totals

## 11. Relationship To Mobile Redesign

This pass aligns with the mobile commerce redesign spec requirement to use VND everywhere. It can be implemented as a focused pass before or alongside redesign Tasks 7–10, reusing existing `formatVnd()` from Task 1.
