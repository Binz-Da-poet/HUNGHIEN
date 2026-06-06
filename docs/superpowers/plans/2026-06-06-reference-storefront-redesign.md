# Reference Storefront Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the storefront composition with a close responsive implementation of the supplied electronics retail reference powered entirely by the homepage CMS payload.

**Architecture:** Fetch one aggregate homepage payload on the server and render ordered sections through a section registry. Preserve existing cart, buy-now, product image, VND formatting, and product discovery behavior while replacing the visual shell.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Zustand, Lucide React.

---

### Task 1: Add Homepage Payload Types And Fetcher

**Files:**
- Create: `apps/storefront/lib/homepage.ts`
- Create: `apps/storefront/lib/homepage.test.ts`

- [ ] Define typed homepage payload interfaces matching the CMS API.
- [ ] Implement `getHomepage()` with API URL config, revalidation, and safe fallback payload.
- [ ] Implement `getVisibleSections(payload)` ordered by `sortOrder`, skipping empty sections.
- [ ] Test ordering, inactive omission, and empty-section omission.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: add storefront homepage cms client`.

---

### Task 2: Build Reference Header And Mobile Bottom Navigation

**Files:**
- Modify: `apps/storefront/components/site-header.tsx`
- Create: `apps/storefront/components/mobile-bottom-nav.tsx`
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/app/globals.css`

- [ ] Implement desktop utility bar with hotline/store/address/login/cart.
- [ ] Implement desktop main logo/search/category/support row.
- [ ] Implement desktop product navigation row.
- [ ] Implement compact navy mobile header and prominent search field.
- [ ] Add fixed mobile bottom navigation with the five approved items and cart badge.
- [ ] Add footer driven by store settings.
- [ ] Ensure main content has bottom padding on mobile so bottom navigation never covers actions.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: add reference storefront navigation shell`.

---

### Task 3: Build Banner Carousel And Featured Categories

**Files:**
- Create: `apps/storefront/components/homepage/banner-carousel.tsx`
- Create: `apps/storefront/components/homepage/dynamic-banner.tsx`
- Create: `apps/storefront/components/homepage/featured-categories.tsx`

- [ ] Render artwork banners with `<picture>` desktop/mobile sources and safe fallback.
- [ ] Render dynamic banners with navy/gold composition, selected product imagery, heading, supporting copy, and CTA.
- [ ] Add accessible carousel controls, dots, and reduced-motion behavior.
- [ ] Render dense desktop category row and four-column mobile category grid.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: add homepage banners and categories`.

---

### Task 4: Build Product Groups And Reference Product Card

**Files:**
- Modify: `apps/storefront/components/product-card.tsx`
- Create: `apps/storefront/components/homepage/product-group-section.tsx`
- Create: `apps/storefront/components/homepage/favorite-button.tsx`

- [ ] Match reference card hierarchy: image, discount, favorite, name, rating, price, original price, and navy `Mua ngay`.
- [ ] Preserve existing add-to-cart and buy-now state behavior.
- [ ] Render CMS-selected product groups in order with title and `Xem tất cả`.
- [ ] Use two columns on mobile and dense multi-column desktop grid.
- [ ] Ensure longest product names and prices do not resize controls.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: add reference homepage product groups`.

---

### Task 5: Build Benefit, Brand, Trust, And Footer Sections

**Files:**
- Create: `apps/storefront/components/homepage/benefit-strip.tsx`
- Create: `apps/storefront/components/homepage/brand-strip.tsx`
- Create: `apps/storefront/components/homepage/trust-strip.tsx`
- Create: `apps/storefront/components/site-footer.tsx`

- [ ] Map supported benefit icon keys to Lucide icons.
- [ ] Render dense desktop benefit/trust strips and mobile scrollers.
- [ ] Render featured brand logos in a horizontal scroller.
- [ ] Render full desktop footer from settings and compact mobile footer.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: add storefront trust and brand sections`.

---

### Task 6: Compose CMS Homepage

**Files:**
- Modify: `apps/storefront/app/page.tsx`
- Create: `apps/storefront/components/homepage/homepage-section-renderer.tsx`

- [ ] Replace hard-coded homepage sections with `getHomepage()`.
- [ ] Render sections through a typed section registry.
- [ ] Keep search/category product discovery functional.
- [ ] Skip CMS sections with no usable data.
- [ ] Render a usable search/product fallback if homepage API fails.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: compose cms driven reference homepage`.

---

### Task 7: Restyle Product Detail, Cart, And Checkout

**Files:**
- Modify: `apps/storefront/app/products/[id]/page.tsx`
- Modify: `apps/storefront/app/cart/page.tsx`
- Modify: `apps/storefront/app/checkout/page.tsx`
- Modify: `apps/storefront/app/checkout/success/page.tsx`

- [ ] Apply navy/gold/red visual hierarchy.
- [ ] Preserve gallery, VND pricing, add-to-cart, buy-now, cart quantity, and checkout submission behavior.
- [ ] Add trust/delivery signals without duplicating desktop homepage density.
- [ ] Keep sticky mobile purchase/checkout actions above bottom navigation.
- [ ] Replace every mojibake string with valid Vietnamese.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Commit with `feat: align shopping flow with reference design`.

---

### Task 8: Storefront Verification

- [ ] Run `pnpm --filter storefront build`.
- [ ] Verify API failure fallback.
- [ ] Verify search, category selection, product group links, cart badge, buy-now, cart, and checkout.
- [ ] Verify 390px, tablet, standard desktop, and wide desktop layouts.

