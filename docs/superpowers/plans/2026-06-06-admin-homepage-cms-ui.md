# Admin Homepage CMS UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authenticated admin CMS screens that manage every storefront homepage section and use the navy/gold system without sacrificing operational clarity.

**Architecture:** Add a login route and authenticated admin API client, then build focused CMS screens around shared form/list primitives. Preserve and extend the existing responsive admin shell and all uncommitted admin UI improvements.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, NestJS CMS API.

---

### Task 1: Add Admin Authentication UI And Route Protection

**Files:**
- Create: `apps/admin/app/login/page.tsx`
- Create: `apps/admin/components/auth/login-form.tsx`
- Create: `apps/admin/lib/admin-api.ts`
- Create: `apps/admin/middleware.ts`
- Modify: `apps/admin/app/layout.tsx`

- [ ] **Step 1: Implement credential-aware API helper**

Create `adminFetch` that calls `NEXT_PUBLIC_API_URL`, sets `credentials: 'include'`, parses JSON errors, and redirects callers on `401`.

- [ ] **Step 2: Implement login form**

Fields: email and password. Submit to `/auth/admin/login`, show generic inline error, and redirect to `/`.

- [ ] **Step 3: Protect admin routes**

Middleware redirects users without `admin_session` cookie to `/login`, excluding `/login`, Next assets, and public files.

- [ ] **Step 4: Verify**

```powershell
pnpm --filter admin build
```

- [ ] **Step 5: Commit**

```powershell
git add apps/admin/app/login apps/admin/components/auth apps/admin/lib/admin-api.ts apps/admin/middleware.ts apps/admin/app/layout.tsx
git commit -m "feat: add admin login UI"
```

---

### Task 2: Extend Admin Navigation And CMS Shared Components

**Files:**
- Modify: `apps/admin/components/layout/sidebar.tsx`
- Create: `apps/admin/components/cms/cms-page-header.tsx`
- Create: `apps/admin/components/cms/status-toggle.tsx`
- Create: `apps/admin/components/cms/order-controls.tsx`
- Create: `apps/admin/components/cms/image-upload-field.tsx`
- Create: `apps/admin/components/cms/cms-feedback.tsx`

- [ ] **Step 1: Add CMS navigation items**

Add exact labels:

```ts
['Banner', 'Bố cục trang chủ', 'Nhóm sản phẩm nổi bật', 'Thương hiệu', 'Cam kết dịch vụ', 'Thông tin cửa hàng']
```

- [ ] **Step 2: Build shared CMS controls**

Controls must support:

- Active/inactive toggle.
- Move up/down.
- Reusable image upload with preview and clear error.
- Page-level success/error feedback.

- [ ] **Step 3: Verify**

```powershell
pnpm --filter admin build
```

- [ ] **Step 4: Commit**

```powershell
git add apps/admin/components/layout/sidebar.tsx apps/admin/components/cms
git commit -m "feat: add admin cms navigation and controls"
```

---

### Task 3: Build Homepage Layout Manager

**Files:**
- Create: `apps/admin/app/homepage-layout/page.tsx`
- Create: `apps/admin/components/cms/homepage-section-list.tsx`

- [ ] **Step 1: Load sections**

Fetch `/admin/homepage/sections` using `adminFetch`.

- [ ] **Step 2: Render ordered responsive list**

Each item displays title, type, status, active toggle, and up/down icon buttons.

- [ ] **Step 3: Persist reorder**

Send ordered IDs to `PATCH /admin/homepage/sections/reorder`. Optimistically update, rollback on failure, and show feedback.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --filter admin build
git add apps/admin/app/homepage-layout apps/admin/components/cms/homepage-section-list.tsx
git commit -m "feat: add homepage layout manager"
```

---

### Task 4: Build Banner Manager

**Files:**
- Create: `apps/admin/app/banners/page.tsx`
- Create: `apps/admin/app/banners/new/page.tsx`
- Create: `apps/admin/app/banners/[id]/edit/page.tsx`
- Create: `apps/admin/components/cms/banner-form.tsx`
- Create: `apps/admin/components/cms/banner-list.tsx`

- [ ] **Step 1: Implement banner list**

Display preview, mode, schedule, active status, order controls, edit, and delete.

- [ ] **Step 2: Implement two-mode form**

`ARTWORK` shows desktop/mobile upload, alt text, and CTA URL. `DYNAMIC` shows heading, description, CTA, background, and selected products.

- [ ] **Step 3: Add validation**

Require desktop image for artwork mode. Require heading for dynamic mode. Ensure end date is after start date.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --filter admin build
git add apps/admin/app/banners apps/admin/components/cms/banner-form.tsx apps/admin/components/cms/banner-list.tsx
git commit -m "feat: add homepage banner management"
```

---

### Task 5: Build Featured Category And Product Group Managers

**Files:**
- Create: `apps/admin/app/featured-categories/page.tsx`
- Create: `apps/admin/app/product-groups/page.tsx`
- Create: `apps/admin/app/product-groups/[id]/edit/page.tsx`
- Create: `apps/admin/components/cms/featured-category-manager.tsx`
- Create: `apps/admin/components/cms/product-group-form.tsx`
- Create: `apps/admin/components/cms/product-picker.tsx`

- [ ] **Step 1: Implement featured category manager**

Allow selecting a catalog category, overriding display name, uploading image, toggling active, and ordering.

- [ ] **Step 2: Implement product picker**

Search products by name, add/remove selected products, and move selected products up/down.

- [ ] **Step 3: Implement product group form**

Manage name, slug, title, accent, active state, group order, and ordered products.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --filter admin build
git add apps/admin/app/featured-categories apps/admin/app/product-groups apps/admin/components/cms/featured-category-manager.tsx apps/admin/components/cms/product-group-form.tsx apps/admin/components/cms/product-picker.tsx
git commit -m "feat: manage featured categories and product groups"
```

---

### Task 6: Build Brand, Benefit, And Store Settings Managers

**Files:**
- Create: `apps/admin/app/brands/page.tsx`
- Create: `apps/admin/app/benefits/page.tsx`
- Create: `apps/admin/app/store-settings/page.tsx`
- Create: `apps/admin/components/cms/brand-manager.tsx`
- Create: `apps/admin/components/cms/benefit-manager.tsx`
- Create: `apps/admin/components/cms/store-settings-form.tsx`

- [ ] **Step 1: Implement brand manager**

Manage name, logo, target URL, active status, and order.

- [ ] **Step 2: Implement benefit manager**

Manage supported icon key, title, description, active status, and order.

- [ ] **Step 3: Implement settings form**

Manage hotline, address, email, social links, company summary, support/policy links, newsletter copy, and payment presentation.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --filter admin build
git add apps/admin/app/brands apps/admin/app/benefits apps/admin/app/store-settings apps/admin/components/cms/brand-manager.tsx apps/admin/components/cms/benefit-manager.tsx apps/admin/components/cms/store-settings-form.tsx
git commit -m "feat: manage brands benefits and store settings"
```

---

### Task 7: Admin CMS Verification

- [ ] Run `pnpm --filter admin build`.
- [ ] Verify unauthenticated redirect to `/login`.
- [ ] Verify login, logout, and expired-session behavior.
- [ ] Verify create/edit/delete/toggle/order for every CMS resource.
- [ ] Verify 390px and desktop layouts have no horizontal overflow.

