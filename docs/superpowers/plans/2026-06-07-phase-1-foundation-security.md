# Phase 1 Foundation and Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vá các lỗi nền tảng và bảo mật đang chặn MVP: secret hygiene, dependency dễ tổn thương, session admin, API validation, catalog public/admin và upload ảnh.

**Architecture:** Giữ Next.js 14/NestJS 10/Prisma 5. Admin và storefront gọi API qua `/api` cùng origin ở browser; server-side storefront dùng `API_INTERNAL_URL`. NestJS áp dụng validation/error format/rate limit tập trung, còn API catalog tách rõ public và admin.

**Tech Stack:** pnpm 9, Turborepo, Next.js 14, React 18, NestJS 10, Prisma 5, PostgreSQL, Vitest 4.1, ESLint 8.

---

## File Map

**Create**

- `.env.example` - danh sách biến môi trường không chứa secret.
- `.eslintrc.cjs` - lint rule chung cho TypeScript.
- `apps/storefront/.eslintrc.json` - cấu hình Next lint không tương tác.
- `apps/api/src/common/filters/api-exception.filter.ts` - format lỗi HTTP/Prisma nhất quán.
- `apps/api/src/common/filters/api-exception.filter.spec.ts` - test mapping lỗi.
- `apps/api/src/common/dto/pagination-query.dto.ts` - pagination có giới hạn.
- `apps/api/src/catalog/admin-product.controller.ts` - API đọc catalog dành cho admin.
- `apps/api/src/catalog/dto/update-product-image.dto.ts` - validate cập nhật ảnh.
- `apps/api/src/homepage/dto/featured-category.dto.ts`
- `apps/api/src/homepage/dto/product-group.dto.ts`
- `apps/api/src/homepage/dto/featured-brand.dto.ts`
- `apps/api/src/homepage/dto/store-benefit.dto.ts`
- `apps/api/src/homepage/dto/cms-upload.dto.ts`
- `apps/api/src/homepage/homepage.service.spec.ts`
- `apps/api/src/homepage/admin-homepage.controller.spec.ts`
- `apps/admin/vitest.config.ts`
- `apps/admin/lib/admin-api.spec.ts`
- `security/audit-allowlist.json` - chỉ ghi advisory không có bản vá tương thích, có ngày hết hạn.
- `scripts/check-production-audit.mjs` - fail khi có critical/high ngoài allowlist.

**Modify**

- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `apps/api/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/main.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/auth/auth.controller.spec.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.service.spec.ts`
- `apps/api/src/catalog/catalog.module.ts`
- `apps/api/src/catalog/product.controller.ts`
- `apps/api/src/catalog/product.controller.spec.ts`
- `apps/api/src/catalog/product.service.ts`
- `apps/api/src/catalog/product.service.spec.ts`
- `apps/api/src/catalog/category.controller.ts`
- `apps/api/src/catalog/category.service.ts`
- `apps/api/src/catalog/dto/create-category.dto.ts`
- `apps/api/src/catalog/dto/create-product.dto.ts`
- `apps/api/src/catalog/image-storage.service.ts`
- `apps/api/src/catalog/image-storage.service.spec.ts`
- `apps/api/src/homepage/admin-homepage.controller.ts`
- `apps/api/src/homepage/homepage.service.ts`
- `apps/api/src/homepage/dto/homepage.dto.ts`
- `apps/admin/package.json`
- `apps/admin/lib/api.ts`
- `apps/admin/lib/admin-api.ts`
- Các file admin đang gọi `fetch` trực tiếp trong `apps/admin/app/**` và `apps/admin/components/products/**`
- `apps/storefront/package.json`
- `apps/storefront/lib/api.ts`
- `apps/storefront/lib/product-images.ts`
- `packages/shared/package.json`
- `packages/shared/src/schemas/product.ts`
- `packages/shared/src/schemas/product.test.ts`

---

### Task 1: Secure secrets, dependencies, lint, and audit policy

**Files:**
- Create: `.env.example`
- Create: `.eslintrc.cjs`
- Create: `apps/storefront/.eslintrc.json`
- Create: `security/audit-allowlist.json`
- Create: `scripts/check-production-audit.mjs`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `apps/api/package.json`
- Modify: `apps/admin/package.json`
- Modify: `apps/storefront/package.json`
- Modify: `packages/shared/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Record the current security baseline**

Run:

```bash
pnpm audit --prod --audit-level=high
pnpm lint
```

Expected: audit reports the current Next/Multer advisories; lint fails because storefront prompts for configuration.

- [ ] **Step 2: Stop tracking the real environment file and add the template**

Run:

```bash
git rm --cached .env
```

Create `.env.example`:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@127.0.0.1:5432/hung_hien_db
PORT=3001
NODE_ENV=development
API_INTERNAL_URL=http://127.0.0.1:3001/api
NEXT_PUBLIC_API_URL=/api
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=replace-with-a-strong-password
```

Confirm `.gitignore` contains `.env`, `.env.*`, and an exception for `.env.example`:

```gitignore
.env
.env.*
!.env.example
```

- [ ] **Step 3: Upgrade only compatible patched dependencies**

Run:

```bash
pnpm --filter admin add next@14.2.35
pnpm --filter storefront add next@14.2.35
pnpm --filter api add multer@2.1.1 @nestjs/throttler@6
pnpm add -Dw eslint@8.57.1 @typescript-eslint/eslint-plugin@8 @typescript-eslint/parser@8
pnpm --filter admin add -D vitest@4.1.6
```

Add a root override so Nest's Multer path also resolves to the patched version:

```json
{
  "pnpm": {
    "overrides": {
      "multer": "2.1.1"
    }
  }
}
```

- [ ] **Step 4: Make lint non-interactive across the monorepo**

Add scripts:

```json
// apps/api/package.json
"lint": "eslint \"src/**/*.ts\" \"prisma/**/*.ts\""

// packages/shared/package.json
"lint": "eslint \"src/**/*.ts\" \"index.ts\""

// apps/admin/package.json and apps/storefront/package.json
"lint": "next lint"
```

Use Next core-web-vitals for frontend and TypeScript recommended rules for API/shared. Keep `no-explicit-any` as warning in Phase 1 so existing code can be migrated incrementally.

- [ ] **Step 5: Add an expiring audit allowlist checker**

`security/audit-allowlist.json` must use this shape:

```json
{
  "advisories": [],
  "expiresOn": "2026-07-07",
  "reason": "Only advisories without a compatible Next.js 14 patch may be listed."
}
```

`scripts/check-production-audit.mjs` must run `pnpm audit --prod --json`, fail on every critical/high advisory not explicitly allowlisted, and fail when `expiresOn` is in the past. Add root script:

```json
"audit:prod": "node scripts/check-production-audit.mjs"
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm lint
pnpm audit:prod
pnpm build
```

Expected: lint is non-interactive; compatible patched advisories are gone; any temporary allowlist entry is explicit and expiring; build passes.

Commit:

```bash
git add .gitignore .env.example .eslintrc.cjs security scripts package.json pnpm-lock.yaml apps/*/package.json packages/shared/package.json apps/storefront/.eslintrc.json
git commit -m "chore: harden dependency and quality baseline"
```

---

### Task 2: Add a consistent API boundary and harden admin sessions

**Files:**
- Create: `apps/api/src/common/filters/api-exception.filter.ts`
- Create: `apps/api/src/common/filters/api-exception.filter.spec.ts`
- Create: `apps/api/src/common/dto/pagination-query.dto.ts`
- Modify: `apps/api/src/main.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/auth/auth.controller.ts`
- Modify: `apps/api/src/auth/auth.controller.spec.ts`
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/src/auth/auth.service.spec.ts`
- Modify: `apps/api/prisma/seed.ts`

- [ ] **Step 1: Write failing filter and auth-hardening tests**

Add tests asserting:

```ts
expect(mapPrismaError({ code: 'P2002' })).toMatchObject({ status: 409, code: 'CONFLICT' });
expect(mapPrismaError({ code: 'P2025' })).toMatchObject({ status: 404, code: 'NOT_FOUND' });
expect(mapPrismaError({ code: 'P2003' })).toMatchObject({ status: 400, code: 'RELATION_CONSTRAINT' });
```

Extend auth tests to assert login prunes expired sessions before creating a new session.

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
pnpm --filter api test -- api-exception.filter.spec.ts auth.service.spec.ts
```

Expected: FAIL because the filter and session pruning do not exist.

- [ ] **Step 3: Implement the global API error format**

Return this shape for all API errors:

```ts
interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
}
```

Register the filter in `main.ts`, and configure validation:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

- [ ] **Step 4: Configure rate limiting and session pruning**

Register `ThrottlerModule` and global `ThrottlerGuard` in `app.module.ts`. Apply a stricter login limit:

```ts
@Throttle({ default: { limit: 5, ttl: 60_000 } })
```

Before creating a session, delete expired sessions:

```ts
await this.prisma.adminSession.deleteMany({
  where: { expiresAt: { lt: new Date() } },
});
```

Require `ADMIN_SEED_PASSWORD` when `NODE_ENV=production`; do not fall back to `Admin123!`.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
pnpm --filter api test
pnpm --filter api build
```

Expected: all API tests pass and error responses use the normalized shape.

Commit:

```bash
git add apps/api
git commit -m "feat(api): harden validation and admin sessions"
```

---

### Task 3: Make browser API calls same-origin and repair admin authentication

**Files:**
- Create: `apps/admin/vitest.config.ts`
- Create: `apps/admin/lib/admin-api.spec.ts`
- Modify: `apps/admin/lib/api.ts`
- Modify: `apps/admin/lib/admin-api.ts`
- Modify: all raw protected `fetch` calls under `apps/admin/app/**`
- Modify: `apps/admin/components/products/product-form.tsx`
- Modify: `apps/admin/components/products/product-image-manager.tsx`
- Modify: `apps/storefront/lib/api.ts`
- Modify: `apps/storefront/lib/product-images.ts`

- [ ] **Step 1: Write the failing `adminFetch` tests**

Test these behaviors:

```ts
it('calls /api on the current origin and includes credentials');
it('does not set JSON content type for FormData');
it('redirects to /login with callbackUrl after a 401');
it('throws the Vietnamese API message for non-2xx responses');
```

- [ ] **Step 2: Run the test and confirm failure**

Run:

```bash
pnpm --filter admin test
```

Expected: FAIL until the admin test script/config and desired helper behavior exist.

- [ ] **Step 3: Implement environment-aware API bases**

Add `"test": "vitest run"` to `apps/admin/package.json` and configure `apps/admin/vitest.config.ts` to include every `**/*.spec.ts` and `**/*.spec.tsx` file so later component tests use the same runner.

Admin browser base:

```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
```

Storefront base:

```ts
export const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:3001/api'
    : process.env.NEXT_PUBLIC_API_URL ?? '/api';
```

Update asset URL resolution so `/uploads/...` stays same-origin in browser and uses `API_INTERNAL_URL` only for server-side needs.

- [ ] **Step 4: Replace every protected admin raw fetch**

Use `adminFetch` for:

- dashboard orders request;
- orders list/status update;
- product create/update/delete;
- product image upload/update/delete.

Public category/product reads may also use `adminFetch` for consistent error handling. No protected admin operation may call raw `fetch`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter admin test
pnpm --filter admin build
pnpm --filter storefront build
rg -n "fetch\\(" apps/admin/app apps/admin/components/products
```

Expected: tests/build pass; remaining raw fetch calls are explicitly public or absent.

Commit:

```bash
git add apps/admin apps/storefront/lib
git commit -m "fix(admin): use authenticated same-origin API requests"
```

---

### Task 4: Separate public/admin catalog and enforce product validation

**Files:**
- Create: `apps/api/src/catalog/admin-product.controller.ts`
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `apps/api/src/catalog/catalog.module.ts`
- Modify: `apps/api/src/catalog/product.controller.ts`
- Modify: `apps/api/src/catalog/product.controller.spec.ts`
- Modify: `apps/api/src/catalog/product.service.ts`
- Modify: `apps/api/src/catalog/product.service.spec.ts`
- Modify: `apps/api/src/catalog/category.controller.ts`
- Modify: `apps/api/src/catalog/category.service.ts`
- Modify: `apps/api/src/catalog/dto/create-category.dto.ts`
- Modify: `apps/api/src/catalog/dto/create-product.dto.ts`
- Modify: `packages/shared/src/schemas/product.ts`
- Modify: `packages/shared/src/schemas/product.test.ts`
- Modify: admin catalog call sites

- [ ] **Step 1: Write failing catalog contract tests**

Cover:

```ts
it('public product list filters status ACTIVE');
it('public product detail returns 404 for INACTIVE');
it('admin product list includes inactive products');
it('rejects originalPrice lower than price');
it('rejects unknown fields and negative stock');
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
pnpm --filter @repo/shared test
pnpm --filter api test -- product.service.spec.ts product.controller.spec.ts
```

Expected: FAIL because status filtering/admin endpoints/cross-field validation do not exist.

- [ ] **Step 3: Add product status and migrate**

Add:

```prisma
enum ProductStatus {
  ACTIVE
  INACTIVE
}
```

Change `Product.status` to `ProductStatus @default(ACTIVE)`. Generate migration:

```bash
pnpm --filter api exec prisma migrate dev --name product_status_enum
```

- [ ] **Step 4: Replace the generated enum conversion with an expand/copy/contract migration**

The migration must preserve existing string values without altering the old column in place:

```sql
ALTER TABLE "Product" ADD COLUMN "status_new" "ProductStatus";
UPDATE "Product" SET "status_new" = "status"::"ProductStatus";
ALTER TABLE "Product" ALTER COLUMN "status_new" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "status_new" SET DEFAULT 'ACTIVE';
ALTER TABLE "Product" DROP COLUMN "status";
ALTER TABLE "Product" RENAME COLUMN "status_new" TO "status";
```

Run the migration in a transaction. Abort and repair it if any existing status is outside `ACTIVE`/`INACTIVE`.

- [ ] **Step 5: Implement public/admin catalog separation**

- Keep `GET /products` and `GET /products/:id` public, always filtering `ACTIVE`.
- Add guarded `GET /admin/products` and `GET /admin/products/:id` for admin.
- Keep writes guarded.
- Update admin product/dashboard/product-picker reads to `/admin/products`.

Use `Prisma.ProductWhereInput` instead of `any`.

- [ ] **Step 6: Align DTO and shared validation**

Use a shared refinement:

```ts
.refine(
  (value) => value.originalPrice == null || value.originalPrice >= value.price,
  { path: ['originalPrice'], message: 'Giá gốc phải lớn hơn hoặc bằng giá bán.' },
)
```

Remove UUID-only validation from `parentId`; since MVP categories are flat, remove `parentId` from create/update DTOs.

- [ ] **Step 7: Verify and commit**

Run:

```bash
pnpm --filter @repo/shared test
pnpm --filter api test
pnpm --filter api build
pnpm --filter admin build
pnpm --filter storefront build
```

Commit:

```bash
git add packages/shared apps/api apps/admin
git commit -m "feat(catalog): separate public and admin product access"
```

---

### Task 5: Harden uploads and remove unvalidated CMS write bodies

**Files:**
- Create: `apps/api/src/catalog/dto/update-product-image.dto.ts`
- Create: `apps/api/src/homepage/dto/featured-category.dto.ts`
- Create: `apps/api/src/homepage/dto/product-group.dto.ts`
- Create: `apps/api/src/homepage/dto/featured-brand.dto.ts`
- Create: `apps/api/src/homepage/dto/store-benefit.dto.ts`
- Modify: `apps/api/src/catalog/product.controller.ts`
- Modify: `apps/api/src/catalog/product.service.ts`
- Modify: `apps/api/src/catalog/image-storage.service.ts`
- Modify: `apps/api/src/catalog/image-storage.service.spec.ts`
- Modify: `apps/api/src/homepage/admin-homepage.controller.ts`
- Modify: `apps/api/src/homepage/homepage.service.ts`
- Modify: `apps/api/src/homepage/dto/homepage.dto.ts`
- Test: `apps/api/src/homepage/homepage.service.spec.ts`
- Test: `apps/api/src/homepage/admin-homepage.controller.spec.ts`

- [ ] **Step 1: Write failing upload and DTO tests**

Add cases for:

```ts
it('rejects a file larger than 5 MB before storage');
it('rejects a file whose signature does not match an allowed image');
it('deletes saved files when database image creation fails');
it('rejects unknown CMS fields');
it('rejects duplicate product IDs in a product group');
```

Controller tests must assert every CMS write endpoint receives a concrete DTO class and rejects an unknown property under the global validation pipe.

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
pnpm --filter api test -- image-storage.service.spec.ts
```

Expected: FAIL for signature/cleanup cases.

- [ ] **Step 3: Enforce upload limits at Multer and storage layers**

Configure interceptors with:

```ts
limits: { fileSize: 5 * 1024 * 1024, files: 8 }
```

Check JPEG/PNG/WebP/GIF magic bytes before writing. Use `Express.Multer.File` instead of `any`.

- [ ] **Step 4: Make file/database writes compensating**

When product image DB creation fails, delete every file saved during that request before rethrowing. Validate product existence before saving files.

- [ ] **Step 5: Replace CMS `any` bodies with DTOs**

Create explicit DTOs for featured categories, product groups/items, brands, benefits, settings JSON structures, section config, and product image updates. Service methods accept those DTOs or Prisma input types, never raw `any`.

- [ ] **Step 6: Verify Phase 1**

Run:

```bash
pnpm lint
pnpm --filter @repo/shared test
pnpm --filter api test
pnpm build
pnpm audit:prod
git diff --check
```

Expected: all commands pass; no tracked `.env`; no protected admin raw fetch; no unvalidated CMS write body.

Commit:

```bash
git add apps/api
git commit -m "feat(api): validate CMS writes and harden uploads"
```
