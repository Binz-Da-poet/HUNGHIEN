# Phase 4 Operations and End-to-End Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện số liệu vận hành, observability, test frontend/E2E, CI, reverse proxy VPS, deploy, backup và restore để MVP có thể vận hành tin cậy.

**Architecture:** API cung cấp dashboard aggregates và health/readiness có kiểm tra database. Playwright chạy ba luồng nghiệp vụ qua toàn bộ stack. VPS dùng Nginx + systemd, deploy bằng migration có kiểm soát, backup PostgreSQL và uploads cùng timestamp.

**Tech Stack:** NestJS 10, Prisma 5/PostgreSQL, Next.js 14, Vitest/Testing Library, Playwright, GitHub Actions, Nginx, systemd, bash.

---

## File Map

**Create**

- `apps/api/src/dashboard/dashboard.module.ts`
- `apps/api/src/dashboard/dashboard.controller.ts`
- `apps/api/src/dashboard/dashboard.service.ts`
- `apps/api/src/dashboard/dashboard.service.spec.ts`
- `apps/api/src/common/middleware/request-id.middleware.ts`
- `apps/api/src/common/interceptors/request-logging.interceptor.ts`
- `apps/api/src/common/interceptors/request-logging.interceptor.spec.ts`
- `apps/admin/lib/dashboard.ts`
- `apps/admin/app/page.spec.tsx`
- `apps/storefront/app/checkout/checkout-flow.spec.tsx`
- `apps/storefront/app/orders/tracking/tracking-form.spec.tsx`
- `playwright.config.ts`
- `tests/e2e/helpers/api.ts`
- `tests/e2e/cod-checkout.spec.ts`
- `tests/e2e/bank-transfer.spec.ts`
- `tests/e2e/admin-content.spec.ts`
- `.github/workflows/ci.yml`
- `deploy/nginx/hung-hien.conf`
- `deploy/systemd/hung-hien-api.service`
- `deploy/systemd/hung-hien-storefront.service`
- `deploy/systemd/hung-hien-admin.service`
- `deploy/scripts/deploy.sh`
- `deploy/scripts/backup.sh`
- `deploy/scripts/restore.sh`
- `docs/operations/vps-deployment.md`
- `docs/operations/backup-restore.md`
- `docs/operations/incident-runbook.md`

**Modify**

- `package.json`
- `pnpm-lock.yaml`
- `apps/api/package.json`
- `apps/api/src/app.module.ts`
- `apps/api/src/app.controller.ts`
- `apps/api/src/app.controller.spec.ts`
- `apps/api/src/app.service.ts`
- `apps/api/src/prisma/prisma.service.ts`
- `apps/admin/app/page.tsx`
- `apps/admin/package.json`
- `apps/storefront/package.json`
- `apps/storefront/store/use-cart.spec.ts`
- `turbo.json`

---

### Task 1: Add accurate dashboard aggregates

**Files:**
- Create: `apps/api/src/dashboard/dashboard.module.ts`
- Create: `apps/api/src/dashboard/dashboard.controller.ts`
- Create: `apps/api/src/dashboard/dashboard.service.ts`
- Create: `apps/api/src/dashboard/dashboard.service.spec.ts`
- Create: `apps/admin/lib/dashboard.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/admin/app/page.tsx`

- [ ] **Step 1: Write failing dashboard service tests**

Assert the service returns:

```ts
{
  paidRevenue: 0,
  pendingOrders: 0,
  unpaidBankTransfers: 0,
  shippingOrders: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  recentOrders: [],
  lowStockItems: []
}
```

Revenue must aggregate only `paymentStatus: PAID`, never a recent-order subset.

- [ ] **Step 2: Run test and confirm failure**

Run:

```bash
pnpm --filter api test -- dashboard.service.spec.ts
```

- [ ] **Step 3: Implement guarded dashboard endpoint**

Expose:

```text
GET /api/admin/dashboard
```

Use parallel Prisma aggregate/count/findMany queries with explicit filters and limits.

- [ ] **Step 4: Replace admin client-side aggregate logic**

`apps/admin/app/page.tsx` calls one `adminFetch('/admin/dashboard')` helper and renders server-calculated metrics.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter api test
pnpm --filter admin build
```

Commit:

```bash
git add apps/api/src/dashboard apps/api/src/app.module.ts apps/admin
git commit -m "feat(admin): add accurate dashboard aggregates"
```

---

### Task 2: Add readiness, request IDs, and safe request logging

**Files:**
- Create: `apps/api/src/common/middleware/request-id.middleware.ts`
- Create: `apps/api/src/common/interceptors/request-logging.interceptor.ts`
- Create: `apps/api/src/common/interceptors/request-logging.interceptor.spec.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/app.controller.ts`
- Modify: `apps/api/src/app.controller.spec.ts`
- Modify: `apps/api/src/app.service.ts`
- Modify: `apps/api/src/prisma/prisma.service.ts`

- [ ] **Step 1: Write failing observability tests**

Test:

```ts
it('returns status ok only when database query succeeds');
it('returns a request id header');
it('logs method, route, status, duration, and request id');
it('does not log request body, cookies, authorization, or session tokens');
```

- [ ] **Step 2: Implement database readiness**

`PrismaService.isHealthy()` executes:

```ts
await this.$queryRaw`SELECT 1`;
```

`GET /api/health` returns `200 { status: 'ok', database: 'ok' }`; database failure returns `503`.

- [ ] **Step 3: Implement request ID and logging**

Accept a valid incoming `x-request-id` or generate `randomUUID()`. Set it on request/response. The interceptor logs only allowlisted metadata.

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm --filter api test
pnpm --filter api build
```

Commit:

```bash
git add apps/api/src/common apps/api/src/app* apps/api/src/prisma/prisma.service.ts
git commit -m "feat(api): add readiness and request logging"
```

---

### Task 3: Complete frontend component and workflow tests

**Files:**
- Create: `apps/admin/app/page.spec.tsx`
- Modify: `apps/storefront/store/use-cart.spec.ts`
- Create: `apps/storefront/app/checkout/checkout-flow.spec.tsx`
- Create: `apps/storefront/app/orders/tracking/tracking-form.spec.tsx`
- Modify: `apps/admin/package.json`
- Modify: `apps/storefront/package.json`

- [ ] **Step 1: Add missing frontend test dependencies**

Run:

```bash
pnpm --filter admin add -D jsdom @testing-library/react @testing-library/jest-dom
pnpm --filter storefront add -D jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Test cart state**

Cover add, increment, update, remove, buy-now, clear, checkout attempt reuse, and last-order summary behavior.

- [ ] **Step 3: Test checkout behavior**

Mock API responses and assert:

- submit disabled while pending;
- stock/price API errors shown in Vietnamese;
- COD success summary;
- bank transfer success summary with QR/instructions;
- retry reuses checkout attempt ID.

- [ ] **Step 4: Test tracking and dashboard**

- Tracking form requires code + phone, renders a matching summary, and shows generic not-found errors.
- Dashboard renders API aggregates exactly and does not calculate revenue client-side.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter admin test
pnpm --filter storefront test
pnpm --filter admin build
pnpm --filter storefront build
```

Commit:

```bash
git add apps/admin apps/storefront
git commit -m "test: cover storefront and admin MVP workflows"
```

---

### Task 4: Add Playwright end-to-end coverage

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/helpers/api.ts`
- Create: `tests/e2e/cod-checkout.spec.ts`
- Create: `tests/e2e/bank-transfer.spec.ts`
- Create: `tests/e2e/admin-content.spec.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install Playwright and add scripts**

Run:

```bash
pnpm add -Dw @playwright/test
pnpm exec playwright install chromium
```

Add:

```json
"test:e2e": "playwright test",
"test:e2e:headed": "playwright test --headed"
```

- [ ] **Step 2: Configure three web servers**

`playwright.config.ts` starts API, storefront, and admin with test environment variables, uses Chromium, captures trace on first retry, and serializes tests that mutate shared order/content data.

- [ ] **Step 3: Write the COD checkout test**

Flow:

1. Seed/ensure an active in-stock product.
2. Open storefront, add product, checkout COD.
3. Assert public code on success page.
4. Track order using code + phone.
5. Login admin, confirm then cancel order.
6. Verify stock restored once through API helper.

- [ ] **Step 4: Write the bank-transfer test**

Flow:

1. Checkout with `BANK_TRANSFER`.
2. Assert QR/account/transfer content and `UNPAID`.
3. Login admin and mark `PAID`.
4. Track order and assert paid status.

- [ ] **Step 5: Write the admin content test**

Flow:

1. Login admin.
2. Create a draft policy with rich text.
3. Assert storefront detail is unavailable.
4. Publish it.
5. Assert policy list/detail render.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test:e2e
```

Commit:

```bash
git add playwright.config.ts tests package.json pnpm-lock.yaml
git commit -m "test: add MVP end to end workflows"
```

---

### Task 5: Add CI quality gates

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `turbo.json`

- [ ] **Step 1: Define root quality scripts**

Add:

```json
"test": "turbo test",
"check": "pnpm lint && pnpm test && pnpm build && pnpm audit:prod"
```

Add this exact Turbo task:

```json
"test": {
  "dependsOn": ["^build"],
  "outputs": []
}
```

- [ ] **Step 2: Create CI workflow**

Workflow requirements:

- trigger on pull request and push to `main`;
- use Node 20 and pnpm 9;
- cache pnpm store;
- provide PostgreSQL service;
- create `.env` from CI secrets/test values;
- run Prisma migrate deploy and seed deterministic test data;
- run `pnpm check`;
- run Playwright and upload report/trace on failure.

- [ ] **Step 3: Verify workflow commands locally**

Run:

```bash
pnpm check
pnpm test:e2e
```

Commit:

```bash
git add .github package.json turbo.json
git commit -m "ci: enforce MVP quality gates"
```

---

### Task 6: Add VPS reverse proxy and systemd deployment

**Files:**
- Create: `deploy/nginx/hung-hien.conf`
- Create: `deploy/systemd/hung-hien-api.service`
- Create: `deploy/systemd/hung-hien-storefront.service`
- Create: `deploy/systemd/hung-hien-admin.service`
- Create: `deploy/scripts/deploy.sh`
- Create: `docs/operations/vps-deployment.md`
- Modify: `apps/api/package.json`

- [ ] **Step 1: Add production API start script**

Add:

```json
"start:prod": "node dist/main.js"
```

- [ ] **Step 2: Write Nginx same-origin routing**

`shop.example.vn` proxies `/` to `3000`, `/api/` and `/uploads/` to `3001`. `admin.example.vn` proxies `/` to `3002`, `/api/` and `/uploads/` to `3001`. Preserve host, forwarded proto, client IP, and request ID. Set upload body limit to `6m`.

- [ ] **Step 3: Write hardened systemd units**

Each unit:

- runs as a non-root `hung-hien` user;
- loads `/etc/hung-hien/*.env`;
- restarts on failure;
- has explicit working directory;
- API gets write access only to uploads;
- storefront/admin cannot write uploads.

- [ ] **Step 4: Write idempotent deploy script**

`deploy.sh` must:

1. verify clean target branch and required env files;
2. `pnpm install --frozen-lockfile`;
3. `pnpm --filter @repo/shared build`;
4. `pnpm --filter api exec prisma migrate deploy`;
5. `pnpm build`;
6. restart services;
7. curl health and storefront/admin URLs;
8. exit non-zero and print rollback instructions on failure.

- [ ] **Step 5: Document first deployment and rollback**

Document PostgreSQL creation, env files, TLS/Certbot, directory permissions, Nginx/systemd install, migration, deploy, health checks, and rollback to the previous Git commit.

- [ ] **Step 6: Validate config and commit**

On a Linux test host/container, run:

```bash
nginx -t -c /absolute/path/to/deploy/nginx/hung-hien.conf
systemd-analyze verify deploy/systemd/*.service
bash -n deploy/scripts/deploy.sh
```

Commit:

```bash
git add deploy/nginx deploy/systemd deploy/scripts/deploy.sh docs/operations/vps-deployment.md apps/api/package.json
git commit -m "ops: add VPS deployment configuration"
```

---

### Task 7: Add backup, restore, and incident runbooks

**Files:**
- Create: `deploy/scripts/backup.sh`
- Create: `deploy/scripts/restore.sh`
- Create: `docs/operations/backup-restore.md`
- Create: `docs/operations/incident-runbook.md`

- [ ] **Step 1: Write backup script**

`backup.sh` must:

- require `DATABASE_URL`, `UPLOADS_DIR`, and `BACKUP_DIR`;
- use `pg_dump --format=custom`;
- archive uploads with `tar`;
- write SHA-256 checksums and metadata containing commit SHA/timestamp;
- remove backups older than configurable retention days;
- exit non-zero if either database or uploads backup fails.

- [ ] **Step 2: Write guarded restore script**

`restore.sh` must:

- require an explicit backup timestamp;
- verify checksums;
- require `CONFIRM_RESTORE=yes`;
- stop API before restore;
- create a pre-restore backup;
- restore database and uploads;
- run `prisma migrate status`;
- restart API and verify `/api/health`.

- [ ] **Step 3: Document recovery and incidents**

Document:

- scheduled backup cron/systemd timer;
- monthly restore drill;
- database unavailable;
- uploads unavailable;
- failed migration;
- credential/session compromise;
- overselling or incorrect stock;
- rollback and communication checklist.

- [ ] **Step 4: Validate shell scripts**

Run on Linux:

```bash
bash -n deploy/scripts/backup.sh
bash -n deploy/scripts/restore.sh
```

Perform a restore drill against a disposable database and uploads directory. Record the date and result in the operations documentation.

- [ ] **Step 5: Verify Phase 4 and commit**

Run:

```bash
pnpm check
pnpm test:e2e
git diff --check
```

Expected: all quality gates pass; deployment config validates; a disposable restore drill succeeds.

Commit:

```bash
git add deploy docs/operations
git commit -m "ops: add backup restore and incident runbooks"
```
