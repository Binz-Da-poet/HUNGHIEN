# Hùng Hiền Điện Máy - Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp thị giác storefront Hùng Hiền Điện Máy lên cao cấp tối giản (Apple Store aesthetic) - giữ thương hiệu navy/gold/red, font Be Vietnam Pro, thêm motion tinh tế.

**Architecture:** Tập trung hóa design tokens vào shared `tailwind-preset.js`, dùng CSS custom properties. Từng component được refactor dần để dùng token thay vì hex cứng. Motion dùng `motion/react` (Framer Motion kế thừa) với `useReducedMotion()`.

**Tech Stack:** Next.js 14, Tailwind CSS 3.4, motion (motion/react), React 18, TypeScript, pnpm

---

## Phase 1: Design Tokens & Foundation

### Task 1.1: Cập nhật shared tailwind preset với colors, borderRadius, boxShadow

**Files:**
- Modify: `packages/shared/tailwind-preset.js`

- [ ] **Step 1: Cập nhật file**

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.625rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',  { lineHeight: '2rem' }],
        '3xl': ['1.875rem',{ lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem',    { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      colors: {
        background: '#f8f9fa',
        surface: '#ffffff',
        'surface-elevated': '#f1f5f9',
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-tertiary': '#94a3b8',
        border: '#e2e8f0',
        brand: {
          primary: '#1A2B4C',
          accent: '#E5C37A',
          danger: '#D10024',
          success: '#16a34a',
        },
      },
      borderRadius: {
        card: '1rem',
        button: '0.75rem',
        input: '0.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'elevated': '0 10px 40px rgba(0,0,0,0.08)',
      },
    },
  },
};
```

- [ ] **Step 2: Build shared package**

```bash
pnpm --filter @repo/shared build
```

Expected: Build succeeds, no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/tailwind-preset.js
git commit -m "feat(shared): add design tokens to tailwind preset - colors, radii, shadows"
```

---

### Task 1.2: Cập nhật storefront tailwind config

**Files:**
- Modify: `apps/storefront/tailwind.config.ts`

- [ ] **Step 1: Thay thế config**

```typescript
import type { Config } from "tailwindcss"

const sharedPreset = require('@repo/shared/tailwind-preset');

const config: Config = {
  presets: [sharedPreset],
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
}
export default config
```

- [ ] **Step 2: Verify Tailwind compiles**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds. No CSS errors.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/tailwind.config.ts
git commit -m "feat(storefront): use shared design tokens preset, enable dark mode class strategy"
```

---

### Task 1.3: Cập nhật admin tailwind config

**Files:**
- Modify: `apps/admin/tailwind.config.ts`

- [ ] **Step 1: Thay thế config**

```typescript
import type { Config } from "tailwindcss";

const sharedPreset = require('@repo/shared/tailwind-preset');

const config: Config = {
  presets: [sharedPreset],
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Verify Tailwind compiles**

```bash
pnpm --filter admin build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/tailwind.config.ts
git commit -m "feat(admin): use shared design tokens preset, enable dark mode"
```

---

### Task 1.4: Cập nhật globals.css với CSS custom properties và base styles

**Files:**
- Modify: `apps/storefront/app/globals.css`
- Modify: `apps/admin/app/globals.css`

- [ ] **Step 1: Cập nhật storefront globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #f8f9fa;
    --surface: #ffffff;
    --surface-elevated: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --border: #e2e8f0;
    --brand-primary: #1A2B4C;
    --brand-accent: #E5C37A;
    --brand-danger: #D10024;
    --brand-success: #16a34a;
    --radius: 1rem;
    --radius-button: 0.75rem;
    --radius-input: 0.5rem;
  }

  html {
    overflow-x: hidden;
  }

  body {
    min-height: 100dvh;
    overflow-x: hidden;
    background: var(--background);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}
```

- [ ] **Step 2: Cập nhật admin globals.css -- giống storefront**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #f8f9fa;
    --surface: #ffffff;
    --surface-elevated: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --border: #e2e8f0;
    --brand-primary: #1A2B4C;
    --brand-accent: #E5C37A;
    --brand-danger: #D10024;
    --brand-success: #16a34a;
    --radius: 1rem;
    --radius-button: 0.75rem;
    --radius-input: 0.5rem;
  }

  html {
    overflow-x: hidden;
  }

  body {
    min-height: 100dvh;
    overflow-x: hidden;
    background: var(--background);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/app/globals.css apps/admin/app/globals.css
git commit -m "feat: add CSS custom properties for design tokens, antialiased text"
```

---

### Task 1.5: Thêm font weight 300 vào Be Vietnam Pro

**Files:**
- Modify: `apps/storefront/app/layout.tsx`

- [ ] **Step 1: Thêm weight '300'**

Sửa dòng 10 trong file hiện tại:

```typescript
// Before:
const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700', '800'] });

// After:
const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['300', '400', '500', '600', '700', '800'] });
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/app/layout.tsx
git commit -m "feat(storefront): add font weight 300 for body text hierarchy"
```

---

## Phase 2: Component Refactors (Storefront)

### Task 2.1: Refactor SiteHeader - 1 hàng, sticky với backdrop blur

**Files:**
- Modify: `apps/storefront/components/site-header.tsx`

- [ ] **Step 1: Viết lại component với cấu trúc 1 hàng, sticky header**

Thay thế toàn bộ nội dung file:

```tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { API_BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function SiteHeader() {
  const itemCount = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60'
          : 'bg-white border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 flex h-16 items-center gap-4 lg:gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="Hùng Hiền Điện Máy">
          <Image
            src="/logo.png"
            alt="Hùng Hiền Điện Máy"
            width={160}
            height={54}
            className={cn(
              'h-9 lg:h-11 w-auto object-contain transition-all duration-300',
              scrolled ? 'lg:h-9' : 'lg:h-11'
            )}
            priority
          />
        </Link>

        {/* Danh mục dropdown (Desktop) */}
        <div className="hidden lg:block relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-4 h-10 rounded-button bg-brand-primary text-brand-accent font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
          >
            <Menu className="h-4 w-4" /> Danh mục
            <ChevronDown className={cn('h-3 w-3 transition-transform', menuOpen && 'rotate-180')} />
          </button>
          {menuOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-surface rounded-card shadow-elevated border border-border py-2 z-50">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-slate-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <Link
                  href="/deals"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-brand-danger hover:bg-red-50 transition-colors"
                >
                  Khuyến mãi hot
                </Link>
              </div>
            </div>
          )}
          {/* Overlay to close menu */}
          {menuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          )}
        </div>

        {/* Search Bar */}
        <form action="/" className="flex-1 min-w-0">
          <div className="relative">
            <input
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full h-10 rounded-input border border-border bg-slate-50 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-text-primary placeholder:text-text-tertiary outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <button
              type="submit"
              className="hidden lg:block absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 bg-brand-primary text-brand-accent text-xs font-semibold rounded-input hover:bg-brand-primary/90 transition-colors"
            >
              Tìm
            </button>
          </div>
        </form>

        {/* Cart (Desktop) */}
        <Link
          href="/cart"
          className="hidden lg:flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors relative"
        >
          <div className="p-2 rounded-full relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium hidden xl:inline">Giỏ hàng</span>
        </Link>

        {/* Mobile Cart */}
        <Link href="/cart" className="lg:hidden relative p-2">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-1 ring-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/site-header.tsx
git commit -m "refactor(storefront): collapse header to 1 row, sticky with backdrop blur, dropdown menu"
```

---

### Task 2.2: Refactor SiteFooter - 3 cột, email form, dùng token

**Files:**
- Modify: `apps/storefront/components/site-footer.tsx`

- [ ] **Step 1: Viết lại footer**

Thay thế toàn bộ nội dung file:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreSettings } from '@/lib/homepage';
import { Facebook, Youtube, Send, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export function SiteFooter({ settings }: { settings: StoreSettings | null }) {
  const s = settings ?? {} as StoreSettings;
  return (
    <footer className="bg-brand-primary text-white pt-20 pb-28 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="block">
              <Image
                src="/logo.png"
                alt="Hùng Hiền Điện Máy"
                width={160}
                height={54}
                className="brightness-0 invert h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
              {s.companySummary || 'Hùng Hiền Điện Máy - Hệ thống mua sắm điện tử, nội thất và gia dụng chính hãng uy tín hàng đầu.'}
            </p>
            <div className="flex gap-3">
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-all border border-white/10">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-all border border-white/10">
                <Youtube className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-all border border-white/10">
                <Send className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Support + Contact */}
          <div className="space-y-6">
            <h4 className="text-brand-accent font-semibold text-sm mb-4">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              <li><Link href="/news" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Tin tức công nghệ</Link></li>
              <li><Link href="/policy/warranty" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="/policy/delivery" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Chính sách giao hàng</Link></li>
              <li><Link href="/policy/payment" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Phương thức thanh toán</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Liên hệ góp ý</Link></li>
            </ul>
          </div>

          {/* Newsletter + Quick Contact */}
          <div className="space-y-6">
            <h4 className="text-brand-accent font-semibold text-sm mb-4">
              Đăng ký nhận tin
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nhận thông tin khuyến mãi và sản phẩm mới.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 h-10 rounded-input border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-brand-accent/50 focus:bg-white/10 transition-all"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-brand-accent text-brand-primary rounded-input font-semibold text-sm hover:bg-white transition-colors flex items-center gap-1"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-brand-accent flex-shrink-0" />
                <span>{s.hotline || '1900 xxxx'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-brand-accent flex-shrink-0" />
                <span>{s.email || 'contact@hunghien.vn'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Hùng Hiền Điện Máy. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-300 transition-colors">Quyền riêng tư</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/site-footer.tsx
git commit -m "refactor(storefront): 3-col footer with email form, clean typography, design tokens"
```

---

### Task 2.3: Refactor ProductCard - tokens, rounded-2xl, hover shadow

**Files:**
- Modify: `apps/storefront/components/product-card.tsx`

- [ ] **Step 1: Viết lại product card**

Thay thế toàn bộ nội dung file:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { getPrimaryImage } from '@/lib/product-images';
import { ProductImage } from '@/components/product-image';
import { useToast } from '@/components/toast-provider';
import {
  StorefrontProduct,
  getDiscountPercent,
  getStockLabel,
  getStockTone,
} from '@/lib/catalog-ui';

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, setBuyNowItem } = useCart();
  const { showToast } = useToast();

  const image = getPrimaryImage(product.images);
  const discount = getDiscountPercent(product);

  const cartItem = {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: image?.url ?? null,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(cartItem);
    showToast('Đã thêm vào giỏ hàng.');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setBuyNowItem(cartItem);
    router.push('/checkout?mode=buy-now');
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card bg-surface transition-all duration-300 hover:shadow-card-hover">
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <ProductImage
          src={image?.url}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 && (
          <span className="absolute left-3 top-3 bg-brand-danger text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Brand + Stock */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-brand-primary/70 bg-brand-accent/10 px-2 py-0.5 rounded">
            {product.brand}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ml-auto ${getStockTone(product.stock)}`}>
            {getStockLabel(product.stock)}
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.id}`} className="group-hover:text-brand-primary transition-colors">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-danger">{formatVnd(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-text-tertiary line-through">
              {formatVnd(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions (show on hover - desktop) */}
        <div className="mt-3 pt-3 border-t border-border flex gap-2 opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 bg-slate-100 text-text-secondary rounded-button text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Thêm vào giỏ
          </button>
          <button
            onClick={handleBuyNow}
            className="h-9 px-4 bg-brand-primary text-brand-accent rounded-button text-xs font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/product-card.tsx
git commit -m "refactor(storefront): product card with design tokens, rounded-2xl, hover shadow"
```

---

### Task 2.4: Refactor tất cả homepage section components với tokens và spacing mới

**Files:**
- Modify: `apps/storefront/components/homepage/banner-carousel.tsx`
- Modify: `apps/storefront/components/homepage/featured-categories.tsx`
- Modify: `apps/storefront/components/homepage/product-group-section.tsx`
- Modify: `apps/storefront/components/homepage/benefit-strip.tsx`
- Modify: `apps/storefront/components/homepage/brand-strip.tsx`
- Modify: `apps/storefront/components/homepage/trust-strip.tsx`

---

#### Sub-task 2.4a: BannerCarousel

- [ ] **Step 1: Cập nhật banner-carousel.tsx**

Thay thế toàn bộ nội dung - các thay đổi chính:
- Dùng token `bg-brand-primary`, `text-brand-accent`, `bg-brand-accent`, `text-brand-primary`
- Indicator pill shape giữ nguyên (đã tốt)
- Font weight: heading `font-bold` (bỏ uppercase, tracking-tight), description `font-medium`
- Aspect ratio: giữ nguyên

```tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HomepageBanner } from '@/lib/homepage';

interface BannerCarouselProps {
  banners: HomepageBanner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] overflow-hidden group bg-slate-200">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {banner.mode === 'ARTWORK' ? (
              <Link href={banner.ctaUrl || '#'} className="block w-full h-full">
                <picture>
                  <source media="(max-width: 640px)" srcSet={banner.mobileImageUrl || banner.desktopImageUrl} />
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.altText || banner.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </picture>
              </Link>
            ) : (
              <div
                className="w-full h-full flex items-center px-6 md:px-12 lg:px-24"
                style={{ backgroundColor: banner.backgroundColor || '#1A2B4C' }}
              >
                <div className="max-w-2xl text-white space-y-3 md:space-y-6">
                  <h2 className="text-xl md:text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                    {banner.heading}
                  </h2>
                  <p className="text-xs md:text-lg text-brand-accent font-medium tracking-wide">
                    {banner.description}
                  </p>
                  {banner.ctaLabel && (
                    <Link
                      href={banner.ctaUrl || '#'}
                      className="inline-block px-6 py-2 md:px-10 md:py-4 bg-brand-accent text-brand-primary font-semibold rounded-button text-xs md:text-sm hover:bg-white transition-all"
                    >
                      {banner.ctaLabel}
                    </Link>
                  )}
                </div>
                {banner.products && banner.products.length > 0 && (
                  <div className="hidden md:block ml-auto max-w-sm">
                    <img
                      src={banner.products[0].product.images?.[0]?.url}
                      alt=""
                      className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-brand-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-brand-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  current === i ? "w-8 bg-brand-accent" : "w-2 bg-white/60 hover:bg-white/80"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

#### Sub-task 2.4b: FeaturedCategories

- [ ] **Step 2: Cập nhật featured-categories.tsx**

Thay thế toàn bộ nội dung:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FeaturedCategory } from '@/lib/homepage';

interface FeaturedCategoriesProps {
  categories: FeaturedCategory[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (!categories.length) return null;

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            Danh mục nổi bật
          </h2>
          <p className="mt-2 text-sm text-text-secondary font-normal">
            Khám phá các dòng sản phẩm được ưa chuộng nhất
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-x-4 gap-y-8">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/categories/${item.category.slug}`}
              className="group flex flex-col items-center text-center gap-3"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-3 bg-slate-50 rounded-full group-hover:bg-brand-accent/10 transition-all duration-300 border border-border group-hover:border-brand-accent/30">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.displayName}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse rounded-full" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-text-primary group-hover:text-brand-primary leading-tight line-clamp-2 min-h-[2.2rem]">
                {item.displayName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### Sub-task 2.4c: ProductGroupSection

- [ ] **Step 3: Cập nhật product-group-section.tsx**

Thay thế toàn bộ nội dung:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { ProductGroup } from '@/lib/homepage';

interface ProductGroupSectionProps {
  group: ProductGroup;
}

export function ProductGroupSection({ group }: ProductGroupSectionProps) {
  if (!group.items.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            {group.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary font-normal">
            <Link
              href={`/collections/${group.slug}`}
              className="hover:text-brand-primary transition-colors inline-flex items-center gap-1 group"
            >
              Xem tất cả <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {group.items.map((item) => (
            <ProductCard key={item.product.id} product={item.product} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### Sub-task 2.4d: BenefitStrip

- [ ] **Step 4: Cập nhật benefit-strip.tsx**

Thay thế toàn bộ nội dung:

```tsx
'use client';

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Gift, Star } from 'lucide-react';
import { StoreBenefit } from '@/lib/homepage';

const ICON_MAP: Record<string, any> = {
  Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Gift, Star
};

export function BenefitStrip({ benefits }: { benefits: StoreBenefit[] }) {
  if (!benefits.length) return null;

  return (
    <section className="bg-brand-primary py-8 md:py-12 overflow-x-auto no-scrollbar">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between gap-8 min-w-max lg:min-w-0">
        {benefits.map((benefit) => {
          const Icon = ICON_MAP[benefit.icon] || ShieldCheck;
          return (
            <div key={benefit.id} className="flex items-center gap-4 group">
              <div className="p-3 bg-brand-accent/10 rounded-full group-hover:bg-brand-accent/20 transition-colors border border-brand-accent/20">
                <Icon className="h-6 w-6 text-brand-accent" />
              </div>
              <div className="text-white">
                <div className="text-sm font-semibold tracking-tight leading-none mb-1.5">{benefit.title}</div>
                <div className="text-[10px] text-brand-accent/80 font-medium tracking-wide">{benefit.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

---

#### Sub-task 2.4e: BrandStrip

- [ ] **Step 5: Cập nhật brand-strip.tsx**

Thay thế toàn bộ nội dung:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FeaturedBrand } from '@/lib/homepage';

export function BrandStrip({ brands }: { brands: FeaturedBrand[] }) {
  if (!brands.length) return null;

  return (
    <section className="py-12 md:py-16 bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight mb-10">
          Thương hiệu đồng hành
        </h2>

        <div className="flex items-center gap-4 lg:gap-10 overflow-x-auto no-scrollbar py-2">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.targetUrl || '#'}
              className="flex-shrink-0 w-28 lg:w-40 h-14 lg:h-20 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all border border-border rounded-card bg-slate-50/50 hover:bg-surface hover:shadow-card-hover"
            >
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="max-h-full max-w-full object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### Sub-task 2.4f: TrustStrip

- [ ] **Step 6: Cập nhật trust-strip.tsx**

Thay thế toàn bộ nội dung:

```tsx
'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, BadgeCheck } from 'lucide-react';

export function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: 'Hàng chính hãng', desc: 'Cam kết 100% chất lượng' },
    { icon: Truck, title: 'Giao hàng hỏa tốc', desc: 'Nhận hàng trong 2h tại TP.HCM' },
    { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn tận tâm chu đáo' },
    { icon: BadgeCheck, title: 'Bảo hành uy tín', desc: 'Dễ dàng tại 100 cửa hàng' },
  ];

  return (
    <section className="bg-surface py-12 md:py-16 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-5 lg:justify-center">
            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary border border-border">
              <item.icon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-primary tracking-tight leading-tight mb-1">
                {item.title}
              </div>
              <div className="text-[11px] text-text-secondary font-medium">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Build verify tất cả**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds, tất cả section compile không lỗi.

- [ ] **Step 8: Commit**

```bash
git add apps/storefront/components/homepage/banner-carousel.tsx apps/storefront/components/homepage/featured-categories.tsx apps/storefront/components/homepage/product-group-section.tsx apps/storefront/components/homepage/benefit-strip.tsx apps/storefront/components/homepage/brand-strip.tsx apps/storefront/components/homepage/trust-strip.tsx
git commit -m "refactor(storefront): all homepage sections use design tokens, clean typography, Apple-style spacing"
```

---

### Task 2.5: Cập nhật mobile-bottom-nav, layout.tsx, và page.tsx với tokens

**Files:**
- Modify: `apps/storefront/components/mobile-bottom-nav.tsx`
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/app/page.tsx`

- [ ] **Step 1: Cập nhật mobile-bottom-nav.tsx**

Sửa dòng 33, 36 - thay `'text-[#1A2B4C]'` thành `'text-brand-primary'` và `'hover:text-[#1A2B4C]'` thành `'hover:text-brand-primary'`:

```tsx
// Line 33 - thay:
isActive ? 'text-[#1A2B4C]' : 'text-slate-500 hover:text-[#1A2B4C]'
// thành:
isActive ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'
```

Sửa dòng 39 - thay `'bg-red-600'` thành `'bg-brand-danger'`:

```tsx
// Line 39 - thay:
className="absolute ... bg-red-600 ..."
// thành:
className="absolute ... bg-brand-danger ..."
```

- [ ] **Step 2: Cập nhật layout.tsx**

Sửa dòng 26 - thay hex cứng bằng tokens:

```tsx
// Before:
<body className={`${beVietnamPro.className} flex min-h-screen flex-col bg-[#f8f9fa] text-slate-950`}>

// After:
<body className={`${beVietnamPro.className} flex min-h-[100dvh] flex-col bg-background text-text-primary`}>
```

- [ ] **Step 3: Cập nhật page.tsx**

Sửa các hex cứng:

```tsx
// Search results section (line 35-36):
// Before:
<div className="pb-12 bg-white min-h-screen">
// After:
<div className="pb-12 bg-surface min-h-[100dvh]">

// Search header icon (line 38):
// Before:
<div className="p-3 bg-[#1A2B4C] text-[#E5C37A] rounded-xl">
// After:
<div className="p-3 bg-brand-primary text-brand-accent rounded-xl">

// Search heading (line 42):
// Before:
<h1 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-tight">
// After:
<h1 className="text-2xl font-bold text-text-primary tracking-tight">

// Search subtext (line 45):
// Before:
<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
// After:
<p className="text-xs font-medium text-text-tertiary mt-1">

// Empty state (line 50):
// Before:
<div className="py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
// After:
<div className="py-32 text-center bg-slate-50 rounded-card border-2 border-dashed border-border">

// Empty state heading (line 52):
// Before:
<h3 className="text-2xl font-black text-slate-900 uppercase">
// After:
<h3 className="text-2xl font-bold text-text-primary">

// Fallback section (line 72-75):
// Before:
<div className="pb-12 bg-white">
// After:
<div className="pb-12 bg-surface">

// Fallback heading (line 75):
// Before:
<h2 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-tight">
// After:
<h2 className="text-2xl font-bold text-text-primary tracking-tight">

// Main wrapper (line 86):
// Before:
<div className="bg-[#f8f9fa] flex flex-col">
// After:
<div className="bg-background flex flex-col">
```

- [ ] **Step 4: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/mobile-bottom-nav.tsx apps/storefront/app/layout.tsx apps/storefront/app/page.tsx
git commit -m "refactor(storefront): remaining hardcoded hex replaced with design tokens"
```

---

## Phase 3: Motion

### Task 3.1: Cài đặt motion package

**Files:**
- Modify: `apps/storefront/package.json`

- [ ] **Step 1: Cài đặt motion**

```bash
pnpm --filter storefront add motion
```

Expected: Package installed, `package.json` và `pnpm-lock.yaml` cập nhật.

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/package.json pnpm-lock.yaml
git commit -m "feat(storefront): add motion (framer-motion successor) for animations"
```

---

### Task 3.2: Hero fade-in animation trên carousel

**Files:**
- Modify: `apps/storefront/components/homepage/banner-carousel.tsx`

- [ ] **Step 1: Thêm fade-in cho carousel container**

Thêm `'use client'` directive đã có sẵn. Thêm import motion và bọc carousel trong motion.div:

Thêm import ở đầu file:

```tsx
import { motion, useReducedMotion } from 'motion/react';
```

Thêm hook reduced motion:

```tsx
const reduce = useReducedMotion();
```

Bọc toàn bộ return trong motion.div:

```tsx
// Thay:
<div className="relative w-full aspect-[16/9] ...">

// Thành:
<motion.div
  initial={reduce ? false : { opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  className="relative w-full aspect-[16/9] ..."
>
  {/* ... nội dung giữ nguyên ... */}
</motion.div>
```

Và thay slide transition dùng spring:

```tsx
// Thay div chứa các slide:
// Before:
<div
  className="flex h-full transition-transform duration-500 ease-out"
  style={{ transform: `translateX(-${current * 100}%)` }}
>

// After:
<motion.div
  className="flex h-full"
  animate={{ x: `-${current * 100}%` }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

- [ ] **Step 2: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/homepage/banner-carousel.tsx
git commit -m "feat(storefront): hero carousel fade-in + spring slide transition"
```

---

### Task 3.3: Scroll reveal cho product sections

**Files:**
- Create: `apps/storefront/components/scroll-reveal.tsx`
- Modify: `apps/storefront/components/homepage/product-group-section.tsx`

- [ ] **Step 1: Tạo ScrollReveal component**

Tạo file `apps/storefront/components/scroll-reveal.tsx`:

```tsx
'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function ScrollReveal({ children, index = 0, className }: ScrollRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Sử dụng ScrollReveal trong ProductGroupSection**

Trong `product-group-section.tsx`, thêm import và bọc mỗi ProductCard:

```tsx
import { ScrollReveal } from '@/components/scroll-reveal';

// Trong grid, thay:
{group.items.map((item) => (
  <ProductCard key={item.product.id} product={item.product} />
))}

// Thành:
{group.items.map((item, i) => (
  <ScrollReveal key={item.product.id} index={i}>
    <ProductCard product={item.product} />
  </ScrollReveal>
))}
```

- [ ] **Step 3: Sử dụng ScrollReveal trong FeaturedCategories, TrustStrip, BrandStrip**

Tương tự, thêm import và bọc items với index.

- [ ] **Step 4: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/scroll-reveal.tsx apps/storefront/components/homepage/product-group-section.tsx apps/storefront/components/homepage/featured-categories.tsx apps/storefront/components/homepage/trust-strip.tsx apps/storefront/components/homepage/brand-strip.tsx
git commit -m "feat(storefront): scroll reveal animation for product sections"
```

---

### Task 3.4: Motion cho product card hover và cart badge

**Files:**
- Modify: `apps/storefront/components/product-card.tsx`
- Modify: `apps/storefront/components/site-header.tsx`

- [ ] **Step 1: Thêm scale animation vào ProductCard**

Trong `product-card.tsx`, thêm import motion:

```tsx
import { motion } from 'motion/react';
```

Thay `article` bằng `motion.article`:

```tsx
// Before:
<article className="group relative flex h-full flex-col overflow-hidden rounded-card bg-surface transition-all duration-300 hover:shadow-card-hover">

// After:
<motion.article
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  className="group relative flex h-full flex-col overflow-hidden rounded-card bg-surface transition-shadow duration-300 hover:shadow-card-hover"
>
```

Và thay `</article>` cuối cùng thành `</motion.article>`.

- [ ] **Step 2: Thêm spring animation cho cart badge**

Trong `site-header.tsx`, thêm import:

```tsx
import { motion, AnimatePresence } from 'motion/react';
```

Thay cart badge span:

```tsx
// Before:
{itemCount > 0 && (
  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-2 ring-white">
    {itemCount}
  </span>
)}

// After (desktop cart):
<AnimatePresence>
  {itemCount > 0 && (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-2 ring-white"
    >
      {itemCount}
    </motion.span>
  )}
</AnimatePresence>
```

Làm tương tự cho mobile cart badge.

- [ ] **Step 3: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/components/product-card.tsx apps/storefront/components/site-header.tsx
git commit -m "feat(storefront): card hover scale + cart badge spring animation"
```

---

### Task 3.5: Skeleton shimmer effect

**Files:**
- Create: `apps/storefront/components/skeleton.tsx`

- [ ] **Step 1: Tạo Skeleton component**

Tạo file `apps/storefront/components/skeleton.tsx`:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-card bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-surface">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-24 mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Thêm shimmer keyframe vào globals.css**

Thêm vào cuối file `apps/storefront/app/globals.css`:

```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@layer utilities {
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
  }
}
```

- [ ] **Step 3: Sử dụng Skeleton trong loading states**

Trong `page.tsx`, thay các placeholder loading hiện tại bằng `ProductGridSkeleton` nếu có loading state.

- [ ] **Step 4: Build verify**

```bash
pnpm --filter storefront build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/skeleton.tsx apps/storefront/app/globals.css
git commit -m "feat(storefront): skeleton shimmer component for loading states"
```

---

## Phase 4: Polish

### Task 4.1: Mobile responsiveness audit

**Files:**
- Modify: `apps/storefront/components/site-header.tsx` (nếu cần)
- Modify: `apps/storefront/components/product-card.tsx` (nếu cần)

- [ ] **Step 1: Kiểm tra layout trên mobile**

Chạy dev server và kiểm tra ở viewport 375px, 390px, 414px:

```bash
pnpm --filter storefront dev
```

Kiểm tra:
- Header: logo + search + cart vừa 1 hàng, không bị tràn
- Product grid: grid-cols-2, card vừa màn
- Footer: 1 cột, không tràn text
- Bottom nav: đủ 5 icon, active state rõ
- Benefit strip: scroll ngang mượt

- [ ] **Step 2: Sửa nếu có vấn đề**

Nếu header quá chật trên mobile ~375px:
- Thu nhỏ logo
- Giảm padding

Nếu product card quá nhỏ:
- Điều chỉnh padding bên trong

- [ ] **Step 3: Build verify**

```bash
pnpm --filter storefront build
```

- [ ] **Step 4: Commit (nếu có thay đổi)**

```bash
git add apps/storefront/components/site-header.tsx apps/storefront/components/product-card.tsx
git commit -m "fix(storefront): mobile responsiveness tweaks"
```

---

### Task 4.2: Empty, loading, error states audit

- [ ] **Step 1: Kiểm tra tất cả states**

- **Empty cart**: `/cart` khi không có sản phẩm
- **Search không kết quả**: `/` + search từ khóa không tồn tại
- **Category trống**: `/categories/xyz` với slug không có sản phẩm
- **Product detail không tồn tại**: `/products/nonexistent`
- **Loading skeleton**: Khi load trang sản phẩm
- **Error boundary**: Khi API fail

- [ ] **Step 2: Sửa nếu có vấn đề**

Mỗi state cần có:
- Icon rõ ràng (từ lucide-react)
- Message tiếng Việt rõ ràng
- Action gợi ý (nút quay lại, link đến trang chủ, v.v.)

- [ ] **Step 3: Commit (nếu có thay đổi)**

---

### Task 4.3: Accessibility & Performance check

- [ ] **Step 1: Contrast check**

Kiểm tra contrast các element quan trọng:
- `text-brand-primary` trên `bg-background` (navy trên nền xám nhạt)
- `text-brand-accent` trên `bg-brand-primary` (gold trên navy)
- `text-white` trên `bg-brand-danger` (trắng trên đỏ)
- `text-text-secondary` trên `bg-background` (body text)
- Placeholder text trong search input

Yêu cầu: WCAG AA (4.5:1 cho body, 3:1 cho large text 18px+)

- [ ] **Step 2: Focus states**

Kiểm tra tất cả interactive elements có focus ring rõ ràng:
- Search input: `focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary`
- Category links: `focus-visible:outline-2 focus-visible:outline-brand-primary`
- Product card links: `focus-visible:ring-2`
- Buttons: `focus-visible:ring-2`

- [ ] **Step 3: Reduced motion**

Kiểm tra `prefers-reduced-motion: reduce`:
- Mở DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion: reduce
- Tất cả animation phải dừng (instant)
- Layout không bị vỡ

- [ ] **Step 4: Lighthouse audit**

```bash
pnpm --filter storefront build && pnpm --filter storefront start
```

Chạy Lighthouse trên production build. Mục tiêu:
- Performance > 90
- Accessibility > 95
- Best Practices > 90

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(storefront): accessibility and performance polish"
```

---

## Explicitly NOT Changed (kiểm tra trước khi merge)

- Không thay đổi route, URL structure
- Không thay đổi nav labels
- Không thay đổi form field names
- Không thay đổi brand logo
- Không thay đổi content trong database (sản phẩm, danh mục, banner)
- Admin layout giữ nguyên (chỉ hưởng tokens từ shared preset)
- Không thêm dark mode toggle (chỉ chuẩn bị darkMode: 'class' strategy)
