# Admin Auth And Homepage CMS API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add basic secure admin sessions and a complete protected homepage CMS API with one public aggregate storefront endpoint.

**Architecture:** Store admin users and hashed session tokens in PostgreSQL. Add dedicated NestJS auth and homepage modules; protected controllers use an admin-session guard, while a public storefront controller returns only active and scheduled homepage content in section order.

**Tech Stack:** NestJS 10, Prisma, PostgreSQL, Vitest, bcryptjs, Node crypto, class-validator.

---

### Task 1: Add Authentication And CMS Prisma Models

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260606100000_admin_auth_homepage_cms/migration.sql`

- [ ] **Step 1: Add Prisma enums**

Add:

```prisma
enum BannerMode {
  ARTWORK
  DYNAMIC
}

enum HomepageSectionType {
  BANNERS
  FEATURED_CATEGORIES
  PRODUCT_GROUP
  SERVICE_BENEFITS
  FEATURED_BRANDS
  TRUST_STRIP
}
```

- [ ] **Step 2: Add auth models**

Add:

```prisma
model AdminUser {
  id           String         @id @default(cuid())
  email        String         @unique
  passwordHash String
  name         String
  isActive     Boolean        @default(true)
  sessions     AdminSession[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model AdminSession {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  expiresAt DateTime
  adminId   String
  admin     AdminUser @relation(fields: [adminId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())

  @@index([adminId])
  @@index([expiresAt])
}
```

- [ ] **Step 3: Add CMS models**

Add:

```prisma
model HomepageBanner {
  id                 String                  @id @default(cuid())
  name               String
  mode               BannerMode
  desktopImageUrl    String?
  mobileImageUrl     String?
  altText            String?
  heading            String?
  description        String?
  ctaLabel           String?
  ctaUrl             String?
  backgroundColor    String?
  backgroundImageUrl String?
  isActive           Boolean                 @default(true)
  startsAt           DateTime?
  endsAt             DateTime?
  sortOrder          Int                     @default(0)
  products           HomepageBannerProduct[]
  createdAt          DateTime                @default(now())
  updatedAt          DateTime                @updatedAt

  @@index([isActive, sortOrder])
}

model HomepageBannerProduct {
  id        String         @id @default(cuid())
  bannerId  String
  productId String
  sortOrder Int            @default(0)
  banner    HomepageBanner @relation(fields: [bannerId], references: [id], onDelete: Cascade)
  product   Product        @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([bannerId, productId])
  @@index([bannerId, sortOrder])
}

model HomepageSection {
  id        String              @id @default(cuid())
  type      HomepageSectionType
  title     String
  isActive  Boolean             @default(true)
  sortOrder Int                 @default(0)
  config    Json?
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  @@index([isActive, sortOrder])
}

model FeaturedCategory {
  id          String   @id @default(cuid())
  categoryId  String
  displayName String
  imageUrl    String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([categoryId])
  @@index([isActive, sortOrder])
}

model FeaturedProductGroup {
  id        String                     @id @default(cuid())
  name      String
  slug      String                     @unique
  title     String
  accent    String?
  isActive  Boolean                    @default(true)
  sortOrder Int                        @default(0)
  items     FeaturedProductGroupItem[]
  createdAt DateTime                   @default(now())
  updatedAt DateTime                   @updatedAt

  @@index([isActive, sortOrder])
}

model FeaturedProductGroupItem {
  id        String               @id @default(cuid())
  groupId   String
  productId String
  sortOrder Int                  @default(0)
  group     FeaturedProductGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  product   Product              @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([groupId, productId])
  @@index([groupId, sortOrder])
}

model FeaturedBrand {
  id        String   @id @default(cuid())
  name      String
  logoUrl   String
  targetUrl String?
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive, sortOrder])
}

model StoreBenefit {
  id          String   @id @default(cuid())
  icon        String
  title       String
  description String
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive, sortOrder])
}

model StoreSettings {
  id               String   @id @default("main")
  hotline          String?
  storeSystemUrl   String?
  address          String?
  email            String?
  socialLinks      Json?
  companySummary   String?
  supportLinks     Json?
  policyLinks      Json?
  newsletterCopy   String?
  paymentMethods   Json?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

Add these reverse relations:

```prisma
model Category {
  // existing fields
  featuredCategory FeaturedCategory?
}

model Product {
  // existing fields
  homepageBannerProducts HomepageBannerProduct[]
  featuredGroupItems     FeaturedProductGroupItem[]
}
```

- [ ] **Step 4: Create and validate migration**

Run:

```powershell
pnpm --dir apps/api exec prisma format
pnpm --dir apps/api exec prisma validate
pnpm --dir apps/api exec prisma migrate dev --name admin-auth-homepage-cms
```

Expected: schema validates and migration is created. If non-interactive Prisma blocks `migrate dev`, generate SQL with `prisma migrate diff`, save it to the exact migration path above, then validate/build.

- [ ] **Step 5: Commit schema**

```powershell
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations
git commit -m "feat: add admin auth and homepage cms schema"
```

---

### Task 2: Implement Admin Authentication Service

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.service.spec.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.controller.spec.ts`
- Create: `apps/api/src/auth/admin-session.guard.ts`
- Create: `apps/api/src/auth/current-admin.decorator.ts`
- Create: `apps/api/src/auth/dto/login.dto.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/main.ts`
- Modify: `apps/api/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install password hashing dependency**

Run:

```powershell
pnpm --filter api add bcryptjs
pnpm --filter api add -D @types/bcryptjs
```

- [ ] **Step 2: Write failing auth service tests**

Cover:

```ts
it('creates a session for valid active admin credentials');
it('returns the same generic unauthorized error for unknown email and wrong password');
it('rejects inactive admins');
it('hashes raw session tokens before persistence');
it('deletes a session on logout');
```

- [ ] **Step 3: Implement session service**

Use:

```ts
const rawToken = randomBytes(32).toString('base64url');
const tokenHash = createHash('sha256').update(rawToken).digest('hex');
```

Sessions expire after seven days. Never persist the raw token.

- [ ] **Step 4: Implement session guard**

Read cookie `admin_session`, hash it, load a non-expired session with active admin, and throw `UnauthorizedException` when invalid.

- [ ] **Step 5: Implement controller**

Endpoints:

```text
POST /api/auth/admin/login
POST /api/auth/admin/logout
GET  /api/auth/admin/me
```

Login and logout set/clear `admin_session` as `httpOnly`, `sameSite=lax`, `path=/`, and `secure` in production.

- [ ] **Step 6: Enable credentialed admin requests**

In `apps/api/src/main.ts`, enable CORS for configured admin/storefront origins with `credentials: true`. Do not use wildcard origin with credentials.

- [ ] **Step 7: Protect existing management operations**

Apply `AdminSessionGuard` to:

- Product/category `POST`, `PATCH`, and `DELETE` routes.
- Order list/status management routes.

Keep public product/category reads, order creation, and storefront homepage reads unguarded.

- [ ] **Step 8: Run verification**

```powershell
pnpm --filter api test -- auth
pnpm --filter api build
```

Expected: PASS.

- [ ] **Step 9: Commit authentication**

```powershell
git add apps/api/src/auth apps/api/src/app.module.ts apps/api/src/main.ts apps/api/src/catalog apps/api/src/orders apps/api/package.json pnpm-lock.yaml
git commit -m "feat: add basic admin session authentication"
```

---

### Task 3: Implement Homepage CMS Services

**Files:**
- Create: `apps/api/src/homepage/homepage.module.ts`
- Create: `apps/api/src/homepage/homepage.service.ts`
- Create: `apps/api/src/homepage/homepage.service.spec.ts`
- Create: `apps/api/src/homepage/dto/homepage.dto.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing service tests**

Cover:

```ts
it('returns active scheduled banners ordered by sortOrder');
it('excludes inactive and expired banners');
it('returns active sections ordered by sortOrder');
it('returns product groups with ordered product images and items');
it('reorders sections atomically');
it('updates singleton store settings');
```

- [ ] **Step 2: Implement public aggregate query**

Implement `getPublicHomepage(now = new Date())` that returns:

```ts
{
  banners,
  sections,
  featuredCategories,
  productGroups,
  featuredBrands,
  benefits,
  settings,
}
```

Filter inactive content and banner schedules in the database query.

- [ ] **Step 3: Implement protected CRUD service methods**

Implement create/update/delete/list methods for each CMS model and `reorderSections(ids: string[])`. Reordering must use a Prisma transaction and assign deterministic zero-based `sortOrder`.

- [ ] **Step 4: Run verification**

```powershell
pnpm --filter api test -- homepage.service.spec.ts
pnpm --filter api build
```

- [ ] **Step 5: Commit service**

```powershell
git add apps/api/src/homepage apps/api/src/app.module.ts
git commit -m "feat: add homepage cms service"
```

---

### Task 4: Expose Public And Protected Homepage APIs

**Files:**
- Create: `apps/api/src/homepage/storefront-homepage.controller.ts`
- Create: `apps/api/src/homepage/admin-homepage.controller.ts`
- Create: `apps/api/src/homepage/homepage.controller.spec.ts`
- Modify: `apps/api/src/homepage/homepage.module.ts`
- Modify: `apps/api/src/catalog/image-storage.service.ts`

- [ ] **Step 1: Write failing controller tests**

Verify:

```ts
it('exposes public homepage payload without guard');
it('protects admin CMS routes with AdminSessionGuard');
it('passes reorder payload to homepage service');
it('passes CRUD payloads to homepage service');
```

- [ ] **Step 2: Implement public endpoint**

```text
GET /api/storefront/homepage
```

- [ ] **Step 3: Implement protected admin endpoints**

Use route prefix `/api/admin/homepage` with resource routes:

```text
/banners
/sections
/sections/reorder
/featured-categories
/product-groups
/brands
/benefits
/settings
```

Apply `AdminSessionGuard` at controller level.

- [ ] **Step 4: Add protected CMS image upload**

Extend the storage abstraction with a `saveCmsImage(namespace, file)` method that permits only safe namespace keys:

```text
banners
featured-categories
brands
store
```

Expose:

```text
POST /api/admin/homepage/uploads/:namespace
```

The endpoint accepts one image, applies the existing MIME and 5MB validation, and returns `{ url, altText }`. Protect it with `AdminSessionGuard`.

- [ ] **Step 5: Run full API verification**

```powershell
pnpm --filter api test
pnpm --filter api build
```

- [ ] **Step 6: Commit controllers**

```powershell
git add apps/api/src/homepage apps/api/src/catalog/image-storage.service.ts
git commit -m "feat: expose homepage cms APIs"
```

---

### Task 5: Seed Initial Admin And Homepage Content

**Files:**
- Create: `apps/api/prisma/seed.ts`
- Modify: `apps/api/package.json`

- [ ] **Step 1: Add seed script**

Seed:

- One admin from `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.
- Default homepage sections in the approved order.
- Default service benefits and store settings.

Hash password with bcryptjs. Abort with a clear error if seed credentials are absent.

- [ ] **Step 2: Add Prisma seed command**

Add:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Install `tsx` as API dev dependency.

- [ ] **Step 3: Verify**

```powershell
pnpm --filter api build
pnpm --filter api test
```

- [ ] **Step 4: Commit**

```powershell
git add apps/api/prisma/seed.ts apps/api/package.json pnpm-lock.yaml
git commit -m "feat: seed admin and homepage defaults"
```
