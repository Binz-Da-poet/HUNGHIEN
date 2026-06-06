# Hùng Hiền Điện Máy — System Design

**Date:** 2026-06-07

---

## 1. Overview

Hùng Hiền Điện Máy is a Vietnamese electronics e-commerce platform with three interconnected apps in a pnpm Turborepo monorepo.

```
apps/
  admin/       Next.js 14 (port 3002)  — Admin dashboard
  api/         NestJS 10  (port 3001)  — REST API
  storefront/  Next.js 14 (port 3000)  — Customer-facing website
packages/
  shared/      TypeScript              — Zod schemas, VND formatting
```

**Key technologies:** Next.js 14 App Router, React 18, NestJS 10, Prisma 5, PostgreSQL, Tailwind CSS 3.4, Zustand 4.5, Vitest 4.1, Lucide React.

**Data flow:** Admin → authenticated API (`/api/admin/*`) → CRUD products/categories/orders/CMS. Storefront → public API (`/api/storefront/*` + `/api/products/*` + `/api/orders`) → browse + purchase. API uses Prisma → PostgreSQL.

---

## 2. Database

14 Prisma models across 4 domains:

### 2.1 Authentication
- `AdminUser` — email, passwordHash (bcryptjs), name, isActive
- `AdminSession` — tokenHash (SHA256), expiresAt (7 days), FK → AdminUser

### 2.2 Catalog
- `Category` (id, name, slug, description, sortOrder)
- `Product` (name, brand, price, originalPrice, stock, description, FK → Category)
- `ProductImage` (url, altText, FK → Product)

### 2.3 Orders
- `Order` — customerName, phone, address, note, paymentMethod (COD/BANK_TRANSFER), status, FK items
- `OrderItem` — quantity, FK → Product, FK → Order

### 2.4 Homepage CMS
- `HomepageBanner` — mode (ARTWORK/DYNAMIC), desktopImageUrl, mobileImageUrl, heading, description, ctaLabel, ctaUrl, backgroundColor, backgroundImageUrl, isActive, startsAt, endsAt, sortOrder, FK products
- `HomepageBannerProduct` — FK → Banner, FK → Product
- `HomepageSection` — type (BANNERS/FEATURED_CATEGORIES/PRODUCT_GROUP/SERVICE_BENEFITS/FEATURED_BRANDS/TRUST_STRIP), title, isActive, sortOrder, config (JSON)
- `FeaturedCategory` — displayName, imageUrl, isActive, sortOrder, FK → Category
- `FeaturedProductGroup` — name, slug (unique), title, accent, isActive, sortOrder, FK items
- `FeaturedProductGroupItem` — FK → Group, FK → Product
- `FeaturedBrand` — name, logoUrl, targetUrl, isActive, sortOrder
- `StoreBenefit` — icon (Lucide key), title, description, isActive, sortOrder
- `StoreSettings` — singleton (id="main"): hotline, storeSystemUrl, address, email, socialLinks (JSON), companySummary, supportLinks (JSON), policyLinks (JSON), newsletterCopy, paymentMethods (JSON)

---

## 3. API

Global prefix `/api`. CORS allows localhost:3000 and localhost:3002 with credentials.

### 3.1 Authentication (`/api/auth/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | Set httpOnly cookie `admin_session` (7 days), return admin info |
| POST | `/logout` | Public | Clear cookie, delete session from DB |
| GET | `/me` | Guard | Return current admin from session |

Session flow: login → bcryptjs verify password → SHA256 hash random 32-byte token → store hash in DB → set raw token as cookie. Guard reads cookie, hashes it, looks up non-expired session with active admin.

### 3.2 Catalog
| Method | Path | Auth |
|--------|------|------|
| GET | `/products`, `/products/:id` | Public |
| POST, PATCH, DELETE | `/products` | Guard |
| GET | `/categories`, `/categories/:slug` | Public |
| POST, PATCH, DELETE | `/categories` | Guard |
| POST | `/admin/homepage/uploads/:namespace` | Guard (image upload, 5MB max, whitelisted namespaces) |

### 3.3 Orders
| Method | Path | Auth |
|--------|------|------|
| POST | `/orders` | Public (customer checkout) |
| GET | `/orders` | Guard |
| PATCH | `/orders/:id/status` | Guard |

### 3.4 Homepage CMS
| Method | Path | Auth |
|--------|------|------|
| GET | `/storefront/homepage` | Public (aggregated payload) |
| CRUD | `/admin/homepage/banners` | Guard |
| CRUD + reorder | `/admin/homepage/sections` | Guard |
| CRUD | `/admin/homepage/featured-categories` | Guard |
| CRUD | `/admin/homepage/product-groups` | Guard |
| CRUD | `/admin/homepage/brands` | Guard |
| CRUD | `/admin/homepage/benefits` | Guard |
| GET, PATCH | `/admin/homepage/settings` | Guard |

The public `/storefront/homepage` returns all active content in one call: banners (filtered by schedule), sections (ordered by sortOrder), featured categories, product groups (with images and items), brands, benefits, and store settings. Inactive and expired content is filtered at the database query level.

---

## 4. Admin Dashboard

### 4.1 Route Protection
Middleware redirects to `/login` if `admin_session` cookie is absent (excludes `/login`, Next.js assets, public files).

### 4.2 Pages (18 routes)

**Sales Management:**
- **Dashboard** (`/`) — Live metrics (revenue, pending orders, low stock, available products), recent orders list, low stock alerts. Fetches from API via `useEffect`.
- **Categories** (`/categories`) — Table with CRUD via modal form dialog. Sort order.
- **Products** (`/products`, `/products/new`, `/products/[id]/edit`) — Table with search + CRUD form (name, brand, price, original price, stock, description, category, image upload).
- **Orders** (`/orders`) — Table with status badges, status filtering, detail rows.

**Homepage CMS:**
- **Banners** (`/banners`, `/banners/new`, `/banners/[id]/edit`) — Two-mode form: `ARTWORK` (desktop/mobile image upload, alt text, CTA) / `DYNAMIC` (heading, description, CTA, background, selected products). Schedule dates, active toggle, sort order.
- **Layout** (`/homepage-layout`) — Ordered section list with up/down controls, active toggle. Persists reorder via `PATCH /sections/reorder`.
- **Product Groups** (`/product-groups`, `/product-groups/[id]/edit`) — Name, slug, title, accent, product picker (search + add/remove/reorder).
- **Featured Categories** (`/featured-categories`) — Category picker, display name, image, order.
- **Brands** (`/brands`) — Name, logo URL, target URL, order.
- **Benefits** (`/benefits`) — Icon key (Lucide), title, description, order.
- **Store Settings** (`/store-settings`) — Singleton form: hotline, address, email, social links, company summary, support/policy links, newsletter copy, payment methods.

### 4.3 Shared CMS Components
`CmsPageHeader`, `StatusToggle`, `OrderControls` (up/down), `ImageUploadField` (preview + error), `CmsFeedback` (success/error toast).

### 4.4 Visual System
- **Primary:** Navy `#1A2B4C` — headers, buttons, active states, summary panels
- **Accent:** Gold `#E5C37A` — CTAs, highlights, labels, prices in dark backgrounds
- **Background:** `#f8fafc` (slate-50)
- **Typography:** Vietnamese text, uppercase tracking, font-black for headings
- **Responsive:** 390px mobile → full desktop. Tables become mobile-friendly cards.

---

## 5. Storefront

### 5.1 User Flow
Homepage → Category browse → Product detail → Add to cart → Cart → Checkout → Success

### 5.2 Homepage (CMS-Driven)
Server component fetches `GET /api/storefront/homepage` with ISR revalidation. `HomepageSectionRenderer` maps section types to components:

| Section Type | Component | Content |
|---|---|---|
| BANNERS | `BannerCarousel` | Artwork (picture desktop/mobile) or Dynamic (navy/gold composition with product) |
| FEATURED_CATEGORIES | `FeaturedCategories` | Desktop row / mobile 4-column grid |
| PRODUCT_GROUP | `ProductGroupSection` | Title + "Xem tất cả" link + product card grid |
| SERVICE_BENEFITS | `BenefitStrip` | Icon + title + description, horizontal scroll on mobile |
| FEATURED_BRANDS | `BrandStrip` | Logo horizontal scroller |
| TRUST_STRIP | `TrustStrip` | Trust badges |

Fallback: if CMS API fails, displays all products from catalog API.

### 5.3 Navigation
- **Desktop header:** Utility bar (hotline, address, login, cart badge) → Logo + search bar + category selector + support links → Product category navigation row.
- **Mobile header:** Compact navy bar with hamburger menu, logo, cart badge. Prominent search field below.
- **Mobile bottom nav:** Fixed bar (5 items: Home, Categories, Cart with badge, Favorites, Account). Main content has bottom padding to prevent overlap.

### 5.4 Product Card
Hierarchy: image → discount badge (% red) → favorite button → product name → star rating → price (VND) → original price (strikethrough) → "Mua ngay" button (navy). Two columns on mobile, dense grid on desktop.

### 5.5 Product Detail Page
Left: image gallery (main + thumbnails) with zoom effect. Right: brand badge (navy/gold) → product name → rating/sold/stock bar → price box (navy background, gold label, VND price, savings badge) → service perks grid → CTA buttons (add to cart outlined / buy now filled). Description section below.

### 5.6 Cart
Item list (image, name, quantity ±, line total, remove) + sticky summary panel (navy background, gold accents): subtotal, free shipping, express delivery badge, total, "Checkout" CTA. Empty state with illustration. Mobile sticky total bar above bottom nav.

### 5.7 Checkout
Two-step form: (1) Customer info — name, phone, address, note; (2) Payment method — COD or bank transfer radio. Right panel (navy): order items list, subtotal, shipping, total, "Place Order" button. Success redirect clears cart.

### 5.8 State Management
Zustand `useCart` store: `items[]`, `addItem`, `removeItem`, `updateQuantity`, `getTotal`, `clearCart`. `buyNowItem` for direct purchase flow. Persisted via zustand middleware.

### 5.9 Visual System
- **Navy** `#1A2B4C` — headers, buttons, price boxes, summary panels
- **Gold** `#E5C37A` — CTAs, accents, highlights, labels on dark backgrounds
- **Red** `#D10024` — discount badges, sale prices
- **Background:** White pages, `#f8f9fa` for cart
- **Typography:** Vietnamese, font-black for headings, uppercase tracking for labels
- **Responsive:** 390px, 768px, 1440px, 1920px breakpoints

---

## 6. Shared Package

`packages/shared` (`@repo/shared`) — TypeScript compiled to CommonJS:

- **Schemas:** `product.ts` — Zod schemas for `CreateProduct`, `ProductImage`, `Product` with validation
- **Formatting:** `currency.ts` — `formatVnd(n)` using `Intl.NumberFormat('vi-VN')`
- Used by admin (VND formatting via lib wrapper) and storefront (VND formatting + catalog utility types)

---

## 7. Testing

| Package | Framework | Scope |
|---------|-----------|-------|
| api | Vitest + NestJS Testing | 8 spec files: auth (service + controller), homepage (service + controller), catalog, orders, image storage |
| shared | Vitest | Product schema validation (3 tests) |
| admin | Build verification | `pnpm build` (type-checking) |
| storefront | Build verification | `pnpm build` (type-checking) |

Run all: `pnpm --filter @repo/shared test` → `pnpm --filter api test` → `pnpm build` (turbo)
