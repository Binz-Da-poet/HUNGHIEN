# Phase 3 Content CMS and Storefront Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm CMS rich-text cho tin tức/chính sách và hoàn thiện mọi route, điều hướng, nội dung và asset còn thiếu trên storefront MVP.

**Architecture:** Một `ContentModule` dùng model `ContentPost` cho cả `NEWS` và `POLICY`. Admin soạn Tiptap JSON đã validate; storefront dùng React renderer allowlist thay vì HTML tùy ý. Store settings là nguồn duy nhất cho liên hệ, social, policy navigation và bank information.

**Tech Stack:** NestJS 10, Prisma 5, Next.js 14 App Router, React 18, Tiptap 2, Zod, Vitest 4.1, Testing Library.

---

## File Map

**Create**

- `packages/shared/src/schemas/content.ts`
- `packages/shared/src/schemas/content.test.ts`
- `apps/api/src/content/content.module.ts`
- `apps/api/src/content/admin-content.controller.ts`
- `apps/api/src/content/storefront-content.controller.ts`
- `apps/api/src/content/content.service.ts`
- `apps/api/src/content/content.service.spec.ts`
- `apps/api/src/content/dto/create-content.dto.ts`
- `apps/api/src/content/dto/update-content.dto.ts`
- `apps/api/src/content/dto/content-query.dto.ts`
- `apps/admin/components/content/content-form.tsx`
- `apps/admin/components/content/content-form.spec.tsx`
- `apps/admin/components/content/content-list.tsx`
- `apps/admin/components/content/rich-text-editor.tsx`
- `apps/admin/components/content/rich-text-editor.spec.tsx`
- `apps/admin/components/content/content-type.ts`
- `apps/admin/app/content/[type]/page.tsx`
- `apps/admin/app/content/[type]/new/page.tsx`
- `apps/admin/app/content/[type]/[id]/edit/page.tsx`
- `apps/storefront/lib/content.ts`
- `apps/storefront/lib/assets.ts`
- `apps/storefront/components/content/rich-text-renderer.tsx`
- `apps/storefront/components/content/rich-text-renderer.spec.tsx`
- `apps/storefront/components/content/content-card.tsx`
- `apps/storefront/app/news/page.tsx`
- `apps/storefront/app/news/[slug]/page.tsx`
- `apps/storefront/app/policy/page.tsx`
- `apps/storefront/app/policy/[slug]/page.tsx`
- `apps/storefront/app/contact/page.tsx`

**Modify**

- `packages/shared/index.ts`
- `apps/api/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/app.module.ts`
- `apps/api/src/catalog/image-storage.service.ts`
- `apps/api/src/homepage/dto/homepage.dto.ts`
- `apps/api/src/homepage/homepage.service.ts`
- `apps/api/prisma/seed-catalog.ts`
- `apps/api/prisma/seed.ts`
- `apps/admin/package.json`
- `apps/admin/components/layout/sidebar.tsx`
- `apps/admin/components/cms/image-upload-field.tsx`
- `apps/admin/components/cms/store-settings-form.tsx`
- `apps/storefront/package.json`
- `apps/storefront/vitest.config.ts`
- `apps/storefront/test/setup.ts`
- `apps/storefront/app/categories/page.tsx`
- `apps/storefront/app/layout.tsx`
- `apps/storefront/lib/homepage.ts`
- `apps/storefront/lib/product-images.ts`
- `apps/storefront/lib/catalog-ui.ts`
- `apps/storefront/components/product-card.tsx`
- `apps/storefront/app/products/[id]/page.tsx`
- `apps/storefront/components/site-header.tsx`
- `apps/storefront/components/site-footer.tsx`
- `apps/storefront/components/mobile-bottom-nav.tsx`
- `apps/storefront/components/homepage/banner-carousel.tsx`
- `apps/storefront/components/homepage/featured-categories.tsx`
- `apps/storefront/components/homepage/brand-strip.tsx`

---

### Task 1: Define and migrate the safe rich-text content model

**Files:**
- Create: `packages/shared/src/schemas/content.ts`
- Create: `packages/shared/src/schemas/content.test.ts`
- Modify: `packages/shared/index.ts`
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Write failing rich-text schema tests**

Allow only:

```ts
type AllowedNode =
  | 'doc'
  | 'paragraph'
  | 'heading'
  | 'text'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'blockquote'
  | 'image'
  | 'hardBreak';

type AllowedMark = 'bold' | 'italic' | 'link';
```

Test:

```ts
expect(RichTextDocumentSchema.parse(validDoc)).toEqual(validDoc);
expect(() => RichTextDocumentSchema.parse(scriptNodeDoc)).toThrow();
expect(() => RichTextDocumentSchema.parse(javascriptLinkDoc)).toThrow();
expect(() => RichTextDocumentSchema.parse(imageWithUnknownAttrs)).toThrow();
```

Links accept only `https:`, `http:`, `mailto:`, `tel:`, and relative `/...` values.

- [ ] **Step 2: Run shared tests and confirm failure**

Run:

```bash
pnpm --filter @repo/shared test
```

Expected: FAIL because content schemas do not exist.

- [ ] **Step 3: Implement shared content contracts**

Export:

```ts
export const ContentTypeSchema = z.enum(['NEWS', 'POLICY']);
export const ContentStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);
export const RichTextDocumentSchema = RichTextNodeSchema.refine((node) => node.type === 'doc');
export const ContentPostSchema = z.object({ ... });
```

Use strict Zod objects so unknown nodes, marks, and attributes are rejected.

- [ ] **Step 4: Add the Prisma content model**

Add:

```prisma
enum ContentType {
  NEWS
  POLICY
}

enum ContentStatus {
  DRAFT
  PUBLISHED
}

model ContentPost {
  id          String        @id @default(cuid())
  type        ContentType
  status      ContentStatus @default(DRAFT)
  title       String
  slug        String
  excerpt     String
  coverImageUrl String?
  content     Json
  sortOrder   Int           @default(0)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@unique([type, slug])
  @@index([type, status, publishedAt])
  @@index([type, status, sortOrder])
}
```

- [ ] **Step 5: Migrate, test, and commit**

Run:

```bash
pnpm --filter api exec prisma migrate dev --name content_posts
pnpm --filter api exec prisma validate
pnpm --filter @repo/shared test
```

Commit:

```bash
git add packages/shared apps/api/prisma
git commit -m "feat(content): add safe rich text content model"
```

---

### Task 2: Build guarded admin and published-only storefront content APIs

**Files:**
- Create: `apps/api/src/content/content.module.ts`
- Create: `apps/api/src/content/admin-content.controller.ts`
- Create: `apps/api/src/content/storefront-content.controller.ts`
- Create: `apps/api/src/content/content.service.ts`
- Create: `apps/api/src/content/content.service.spec.ts`
- Create: `apps/api/src/content/dto/create-content.dto.ts`
- Create: `apps/api/src/content/dto/update-content.dto.ts`
- Create: `apps/api/src/content/dto/content-query.dto.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/catalog/image-storage.service.ts`

- [ ] **Step 1: Write failing content service tests**

Cover:

```ts
it('creates drafts after validating rich text JSON');
it('sets publishedAt when publishing a draft without a date');
it('keeps publishedAt as display data and does not auto-publish drafts');
it('lists only PUBLISHED posts on storefront endpoints');
it('sorts NEWS by publishedAt desc');
it('sorts POLICY by sortOrder asc');
it('returns 404 for draft storefront detail');
it('returns 409 for duplicate type and slug');
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
pnpm --filter api test -- content.service.spec.ts
```

- [ ] **Step 3: Implement DTOs and service**

DTO rules:

- title `1..160`;
- slug lowercase kebab-case;
- excerpt `1..500`;
- content must pass `RichTextDocumentSchema`;
- `publishedAt` optional ISO date;
- `sortOrder` non-negative integer.

Service catches composite unique conflicts and returns `409`.

- [ ] **Step 4: Implement controllers**

Guarded admin routes:

```text
GET    /api/admin/content
GET    /api/admin/content/:id
POST   /api/admin/content
PATCH  /api/admin/content/:id
DELETE /api/admin/content/:id
```

Public routes:

```text
GET /api/storefront/content/:type
GET /api/storefront/content/:type/:slug
```

Only accept route types `news` and `policy`, mapping them to Prisma enum values.

- [ ] **Step 5: Add content image namespace**

Allow `content` in CMS upload namespaces. Reuse upload hardening from Phase 1.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm --filter api test
pnpm --filter api build
```

Commit:

```bash
git add apps/api/src/content apps/api/src/app.module.ts apps/api/src/catalog/image-storage.service.ts
git commit -m "feat(api): add content management endpoints"
```

---

### Task 3: Build the admin Tiptap editor and content workflow

**Files:**
- Create: `apps/admin/components/content/content-form.tsx`
- Create: `apps/admin/components/content/content-form.spec.tsx`
- Create: `apps/admin/components/content/content-list.tsx`
- Create: `apps/admin/components/content/rich-text-editor.tsx`
- Create: `apps/admin/components/content/rich-text-editor.spec.tsx`
- Create: `apps/admin/components/content/content-type.ts`
- Create: `apps/admin/app/content/[type]/page.tsx`
- Create: `apps/admin/app/content/[type]/new/page.tsx`
- Create: `apps/admin/app/content/[type]/[id]/edit/page.tsx`
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/components/layout/sidebar.tsx`
- Modify: `apps/admin/components/cms/image-upload-field.tsx`

- [ ] **Step 1: Install editor dependencies**

Run:

```bash
pnpm --filter admin add @tiptap/react@^2 @tiptap/starter-kit@^2 @tiptap/extension-link@^2 @tiptap/extension-image@^2
pnpm --filter admin add -D jsdom @testing-library/react @testing-library/jest-dom
```

Update admin Vitest setup to use jsdom and load `@testing-library/jest-dom`.

- [ ] **Step 2: Write failing content-form tests**

Test:

```ts
it('maps the news route type to NEWS');
it('generates a Vietnamese-safe slug from title until manually edited');
it('submits Tiptap JSON, not HTML');
it('offers only DRAFT and PUBLISHED');
it('uploads cover and inline images through the content namespace');
```

- [ ] **Step 3: Build the constrained rich-text editor**

Toolbar contains only:

- heading 2/3;
- paragraph;
- bold/italic;
- bullet/ordered lists;
- blockquote;
- safe link;
- uploaded image;
- undo/redo.

On change, call `editor.getJSON()`. Do not expose raw HTML editing.

- [ ] **Step 4: Build reusable content list/form**

`content-type.ts` maps:

```ts
news -> { apiType: 'NEWS', label: 'Tin tức' }
policy -> { apiType: 'POLICY', label: 'Chính sách' }
```

List supports keyword/status filters and publish/unpublish actions. Form supports preview, cover image, excerpt, sort order, published date, and status.

- [ ] **Step 5: Add routes and navigation**

Add sidebar entries for `/content/news` and `/content/policy`. Dynamic pages reject unsupported type values with `notFound()`.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm --filter admin test
pnpm --filter admin build
```

Commit:

```bash
git add apps/admin
git commit -m "feat(admin): add rich text content management"
```

---

### Task 4: Build safe storefront content rendering and routes

**Files:**
- Modify: `apps/storefront/vitest.config.ts`
- Modify: `apps/storefront/test/setup.ts`
- Create: `apps/storefront/lib/content.ts`
- Create: `apps/storefront/components/content/rich-text-renderer.tsx`
- Create: `apps/storefront/components/content/rich-text-renderer.spec.tsx`
- Create: `apps/storefront/components/content/content-card.tsx`
- Create: `apps/storefront/app/news/page.tsx`
- Create: `apps/storefront/app/news/[slug]/page.tsx`
- Create: `apps/storefront/app/policy/page.tsx`
- Create: `apps/storefront/app/policy/[slug]/page.tsx`
- Modify: `apps/storefront/package.json`

- [ ] **Step 1: Add frontend test dependencies and failing renderer tests**

Reuse the storefront Vitest/jsdom/Testing Library setup created in Phase 2.

Test:

```ts
it('renders allowed headings, text marks, lists, links, quotes, and images');
it('adds rel=noopener noreferrer to external links');
it('does not render unknown nodes or javascript links');
it('resolves internal upload images');
```

- [ ] **Step 2: Run renderer tests and confirm failure**

Run:

```bash
pnpm --filter storefront test
```

- [ ] **Step 3: Implement the recursive allowlist renderer**

Render each supported Tiptap node to a React element. Unknown node/mark returns `null`; never use `dangerouslySetInnerHTML`.

- [ ] **Step 4: Build content data helpers and pages**

`lib/content.ts` fetches published content with ISR:

- news list/detail: `revalidate: 300`;
- policy list/detail: `revalidate: 3600`.

Generate page metadata from title/excerpt. Return `notFound()` for missing detail.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm --filter storefront test
pnpm --filter storefront build
```

Commit:

```bash
git add apps/storefront
git commit -m "feat(storefront): add news and policy content pages"
```

---

### Task 5: Complete storefront routes, settings, assets, and navigation

**Files:**
- Create: `apps/storefront/lib/assets.ts`
- Create: `apps/storefront/app/categories/page.tsx`
- Create: `apps/storefront/app/contact/page.tsx`
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/lib/homepage.ts`
- Modify: `apps/storefront/lib/product-images.ts`
- Modify: `apps/storefront/lib/catalog-ui.ts`
- Modify: `apps/storefront/components/product-card.tsx`
- Modify: `apps/storefront/app/products/[id]/page.tsx`
- Modify: `apps/storefront/components/site-header.tsx`
- Modify: `apps/storefront/components/site-footer.tsx`
- Modify: `apps/storefront/components/mobile-bottom-nav.tsx`
- Modify: `apps/storefront/components/homepage/banner-carousel.tsx`
- Modify: `apps/storefront/components/homepage/featured-categories.tsx`
- Modify: `apps/storefront/components/homepage/brand-strip.tsx`
- Modify: `apps/admin/components/cms/store-settings-form.tsx`
- Modify: `apps/api/src/homepage/dto/homepage.dto.ts`

- [ ] **Step 1: Write failing navigation and asset helper tests**

Test:

```ts
it('does not expose account, notifications, or favorites links');
it('exposes categories, tracking, news, policy, and contact links');
it('resolves /uploads paths against the current origin');
it('keeps absolute https image URLs unchanged');
```

- [ ] **Step 2: Create one asset URL helper**

Replace product-only naming with:

```ts
export function resolveAssetUrl(url?: string | null): string | null
```

Use it for product images, banners, categories, brands, content images, and QR previews.

- [ ] **Step 3: Add categories and contact pages**

- `/categories` lists every catalog category and links to its slug page.
- `/contact` displays store address, hotline, email, store-system link, and configured social links.

- [ ] **Step 4: Make store settings the navigation/footer source**

Extend admin settings form and API validation for structured social/support/policy links. Render only configured, valid links. Hide newsletter form until an actual subscription endpoint exists.

- [ ] **Step 5: Remove non-MVP and fabricated UI**

- Remove account, notifications, and favorites navigation/actions.
- Remove fake ratings and sold counts from product cards/detail.
- Replace them with stock/availability information.
- Ensure every visible internal route exists.

- [ ] **Step 6: Verify all storefront links**

Run:

```bash
pnpm --filter storefront test
pnpm --filter storefront build
rg -n 'href="/(account|notifications|favorites)' apps/storefront
```

Expected: tests/build pass; grep returns no visible non-MVP links.

Commit:

```bash
git add apps/storefront apps/admin/components/cms/store-settings-form.tsx apps/api/src/homepage
git commit -m "feat(storefront): complete MVP navigation and content routes"
```

---

### Task 6: Verify Phase 3 end to end

**Files:**
- Create: `apps/api/prisma/seed-homepage.ts`
- Create: `apps/api/prisma/seed-content.ts`
- Modify: `apps/api/prisma/seed-catalog.ts`
- Modify: `apps/api/prisma/seed.ts`
- Test: `packages/shared/src/schemas/content.test.ts`
- Test: `apps/api/src/content/content.service.spec.ts`
- Test: `apps/storefront/components/content/rich-text-renderer.spec.tsx`
- Test: admin content-form/list tests created in Task 3

- [ ] **Step 1: Split and complete deterministic MVP seed data**

- Export an idempotent `seedCatalog(prisma)` from the existing `seed-catalog.ts`.
- Move homepage/CMS/settings seed logic into `seed-homepage.ts`.
- Add published/draft news and policy examples in `seed-content.ts`.
- Make `seed.ts` orchestrate admin, catalog, homepage, settings, and content in a deterministic order.
- Include bank/QR settings suitable for local E2E without real credentials.

Run:

```bash
pnpm --filter api exec prisma db seed
pnpm --filter api exec prisma db seed
```

Expected: both runs succeed without duplicate rows and leave enough data for every MVP E2E flow.

- [ ] **Step 2: Run all quality gates**

Run:

```bash
pnpm lint
pnpm --filter @repo/shared test
pnpm --filter api test
pnpm --filter admin test
pnpm --filter storefront test
pnpm build
git diff --check
```

- [ ] **Step 3: Manually verify content workflow**

1. Create a draft news article with every supported rich-text node.
2. Confirm it is absent on storefront.
3. Publish it and confirm list/detail rendering.
4. Create and publish policies; confirm footer/policy listing order.
5. Upload cover/inline images and confirm URLs work through `/uploads`.

- [ ] **Step 4: Manually verify no dead navigation**

Open every visible header, footer, mobile-nav, homepage, category, product, checkout-success, news, policy, tracking, and contact link. Expected: no `404` from visible MVP navigation.

- [ ] **Step 5: Commit verification fixes**

```bash
git add apps packages
git commit -m "test: verify content CMS and storefront completion"
```
