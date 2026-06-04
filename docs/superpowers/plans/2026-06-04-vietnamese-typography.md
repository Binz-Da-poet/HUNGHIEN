# Vietnamese Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Be Vietnam Pro consistently across admin and storefront for readable Vietnamese UI on mobile and desktop.

**Architecture:** Load Be Vietnam Pro through `next/font/google` in each Next.js app root layout, expose it as a CSS variable, wire Tailwind `fontFamily.sans` to that variable, and add base smoothing rules in `globals.css`. No shared package is required.

**Tech Stack:** Next.js 14 App Router, `next/font/google`, Tailwind CSS 3.

**Spec:** `docs/superpowers/specs/2026-06-04-vietnamese-typography-design.md`

---

## File Structure And Responsibilities

- `apps/admin/app/layout.tsx`: load Be Vietnam Pro, apply to `<body>`, keep `lang="vi"`.
- `apps/admin/tailwind.config.ts`: map `fontFamily.sans` to `--font-be-vietnam-pro`.
- `apps/admin/app/globals.css`: antialiased body rendering.
- `apps/storefront/app/layout.tsx`: load Be Vietnam Pro, apply to `<body>`, set `lang="vi"`.
- `apps/storefront/tailwind.config.ts`: map `fontFamily.sans` to `--font-be-vietnam-pro`.
- `apps/storefront/app/globals.css`: antialiased body rendering.

---

### Task 1: Admin Be Vietnam Pro

**Files:**
- Modify: `apps/admin/app/layout.tsx`
- Modify: `apps/admin/tailwind.config.ts`
- Modify: `apps/admin/app/globals.css`

- [ ] **Step 1: Replace Inter with Be Vietnam Pro in admin layout**

Update `apps/admin/app/layout.tsx`:

```tsx
import { Be_Vietnam_Pro } from 'next/font/google';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});
```

Apply to `<html>` and `<body>`:

```tsx
<html lang="vi" className={beVietnamPro.variable}>
  <body className={`${beVietnamPro.className} font-sans antialiased`}>
```

Remove the old `Inter` import.

- [ ] **Step 2: Wire Tailwind sans stack**

Update `apps/admin/tailwind.config.ts`:

```ts
fontFamily: {
  sans: ['var(--font-be-vietnam-pro)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
},
```

- [ ] **Step 3: Add base smoothing rules**

Append to `@layer base` in `apps/admin/app/globals.css`:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Keep existing overflow and background rules.

- [ ] **Step 4: Verify admin build**

Run: `pnpm --filter admin build`

Expected: PASS.

- [ ] **Step 5: Commit admin typography**

```bash
git add apps/admin/app/layout.tsx apps/admin/tailwind.config.ts apps/admin/app/globals.css
git commit -m "feat: use Be Vietnam Pro for admin typography"
```

---

### Task 2: Storefront Be Vietnam Pro

**Files:**
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/tailwind.config.ts`
- Modify: `apps/storefront/app/globals.css`

- [ ] **Step 1: Add Be Vietnam Pro to storefront layout**

Update `apps/storefront/app/layout.tsx`:

```tsx
import { Be_Vietnam_Pro } from 'next/font/google';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});
```

Apply:

```tsx
<html lang="vi" className={beVietnamPro.variable}>
  <body className={`${beVietnamPro.className} flex min-h-screen flex-col font-sans antialiased`}>
```

- [ ] **Step 2: Wire Tailwind sans stack**

Update `apps/storefront/tailwind.config.ts` with the same `fontFamily.sans` block as admin.

- [ ] **Step 3: Add base smoothing rules**

Update `apps/storefront/app/globals.css` `@layer base` body rules to include antialiasing.

- [ ] **Step 4: Verify storefront build**

Run: `pnpm --filter storefront build`

Expected: PASS.

- [ ] **Step 5: Commit storefront typography**

```bash
git add apps/storefront/app/layout.tsx apps/storefront/tailwind.config.ts apps/storefront/app/globals.css
git commit -m "feat: use Be Vietnam Pro for storefront typography"
```

---

### Task 3: Manual Typography QA

**Files:**
- Modify only if verification finds clipping or fallback issues.

- [ ] **Step 1: Start dev services**

Run: `pnpm dev`

Expected: admin on `http://localhost:3002`, storefront on `http://localhost:3000`.

- [ ] **Step 2: Verify Vietnamese rendering**

Check at 390px width:

- Admin dashboard shortcuts
- Admin products list with seeded names such as `Điện thoại`, `Ốp lưng iPhone 15`
- Storefront home product cards and prices such as `12.500.000₫`

Expected: diacritics render clearly, no unwanted horizontal scroll, same font family across both apps.

- [ ] **Step 3: Fix only typography regressions**

If a page still uses a conflicting font family, remove that override in the owning file and rerun the relevant build command.

---

## Plan Self-Review

- Spec coverage: font choice, weights, subsets, admin/storefront scope, Tailwind wiring, verification, and out-of-scope items are covered.
- Scope control: no logo font, no shared package, no mass refactor of text size utilities.
- Consistency: both apps use the same variable name, weights, and fallback stack.
