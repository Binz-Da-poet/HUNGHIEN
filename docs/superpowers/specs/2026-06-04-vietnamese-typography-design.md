# Vietnamese Typography - Design Specification

## 1. Goal

Standardize admin and storefront typography for readable, modern Vietnamese UI on mobile and desktop. Replace the current mixed setup (admin `Inter` with `latin` only, storefront system fonts) with one cohesive font system aligned with the mobile commerce redesign.

## 2. Chosen Approach

Use **Be Vietnam Pro** as the single sans-serif font across admin and storefront.

This approach was selected over:

- **Inter + `vietnamese` subset** — smaller diff but less optimized for Vietnamese commerce UI.
- **Split fonts (storefront vs admin)** — rejected because it breaks the shared visual system in the mobile redesign spec.

Be Vietnam Pro is widely used in Vietnamese e-commerce, renders diacritics clearly on small screens, and is available via Google Fonts with Next.js `next/font/google`.

## 3. Current Problems

- Admin loads `Inter` with `subsets: ['latin']` only, which is not the intended setup for Vietnamese copy.
- Storefront has no explicit font and falls back to OS defaults, so admin and storefront feel inconsistent.
- Vietnamese product names, addresses, and order labels need stable weight and spacing at 390px width.

## 4. Typography System

### Primary Font

- **Family:** Be Vietnam Pro
- **Source:** Google Fonts through `next/font/google`
- **Subsets:** `vietnamese`, `latin`
- **Weights:** `400`, `500`, `600`, `700`
- **CSS variable:** `--font-be-vietnam-pro`
- **Fallback stack:** `"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif`

### Weight Usage

| Role | Weight | Examples |
|------|--------|----------|
| Body, descriptions, table cells | 400 | Product description, form helper text |
| Navigation, labels, filters | 500 | Sidebar links, form labels, badges |
| Section headings, card titles | 600 | Dashboard sections, product card name |
| Page titles, prices, primary CTAs | 700 | H1, VND price, `Mua ngay`, save buttons |

### Size Rules

- Minimum body copy on mobile: **14px** (`text-sm` or larger).
- Do not use `text-xs` for primary Vietnamese reading content except compact metadata (timestamps, helper hints).
- Keep existing heading size classes; only change the font family and smoothing, not the overall scale system in this pass.

### Rendering

Apply on `body`:

- `-webkit-font-smoothing: antialiased`
- `-moz-osx-font-smoothing: grayscale`

No letter-spacing overrides unless a specific component already uses Tailwind tracking utilities.

## 5. Application Scope

### Admin

- Replace `Inter` in `apps/admin/app/layout.tsx` with Be Vietnam Pro.
- Apply the font class to `<body>`.
- Keep `lang="vi"`.

### Storefront

- Add Be Vietnam Pro in `apps/storefront/app/layout.tsx`.
- Apply the font class to `<body>`.
- Update `lang="en"` to `lang="vi"` while touching layout for typography consistency.

### Tailwind

In both apps:

- Extend `theme.fontFamily.sans` to use `var(--font-be-vietnam-pro)` plus the fallback stack.
- Rely on Tailwind's default `font-sans` on `body` through the Next Font className; no per-component font overrides.

### Global CSS

In both apps' `globals.css`:

- Add base-layer smoothing rules for `body`.
- Do not introduce a second font family in CSS.

## 6. Out Of Scope

- Logo/display font for the HUNG HIEN wordmark
- Self-hosted font files or CDN outside Next Font
- Typography for emails, PDFs, or API responses
- Refactoring every `text-xs` usage in the codebase
- Monospace font for admin tables

These can be added later without changing the core Be Vietnam Pro setup.

## 7. Verification

Manual checks at **390px**, **768px**, and desktop:

- Vietnamese strings render with correct diacritics: `Điện thoại`, `Nguyễn Văn An`, `Ốp lưng`, `Sắp hết hàng`
- VND amounts remain readable: `12.500.000₫`
- Admin drawer navigation and storefront sticky purchase bar do not clip accented characters
- Admin and storefront visually use the same font family

Build verification:

- `pnpm --filter admin build` — PASS
- `pnpm --filter storefront build` — PASS

## 8. Relationship To Mobile Redesign

This typography pass should be implemented together with or immediately before storefront foundation work (Task 8 in the mobile commerce redesign plan) to avoid touching `layout.tsx` and `globals.css` twice.

The main mobile redesign spec remains authoritative for colors, layout, and commerce flows. This document only defines typography.
