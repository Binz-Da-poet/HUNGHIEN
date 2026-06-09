# Migrate Font to Be Vietnam Pro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Inter with Be Vietnam Pro across storefront and admin apps, with a shared Tailwind preset defining the font family and typography scale.

**Architecture:** A new JS file `packages/shared/tailwind-preset.js` exports a Tailwind preset with `fontFamily.sans` and `fontSize` scale. Both `apps/storefront/tailwind.config.ts` and `apps/admin/tailwind.config.ts` import this preset. Each app's `layout.tsx` loads Be Vietnam Pro via `next/font/google` as a variable font.

**Tech Stack:** Next.js 14, Tailwind CSS 3.4, `next/font/google`, pnpm Turborepo

---

### Task 1: Create shared Tailwind preset

**Files:**
- Create: `packages/shared/tailwind-preset.js`

- [ ] **Step 1: Create the preset file**

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
          'Helvetica Neue',
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
    },
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/tailwind-preset.js
git commit -m "feat: add shared Tailwind preset with Be Vietnam Pro font and typography scale"
```

---

### Task 2: Update storefront layout to use Be Vietnam Pro

**Files:**
- Modify: `apps/storefront/app/layout.tsx`

- [ ] **Step 1: Replace Inter import and usage**

Sửa `apps/storefront/app/layout.tsx`:

- Dòng 3: `import { Inter } from 'next/font/google';` → `import { Be_Vietnam_Pro } from 'next/font/google';`
- Dòng 10: `const inter = Inter({ subsets: ['latin', 'vietnamese'] });` → `const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'] });`
- Dòng 26: `${inter.className}` → `${beVietnamPro.className}`

File sau khi sửa:

```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { ToastProvider } from '@/components/toast-provider';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { SiteFooter } from '@/components/site-footer';
import { getHomepage } from '@/lib/homepage';

const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Hùng Hiền Điện Máy | Mua sắm điện tử, gia dụng chính hãng',
  description: 'Hùng Hiền Điện Máy - Hệ thống bán lẻ điện tử, nội thất và gia dụng uy tín. Giao nhanh, giá rõ, bảo hành chính hãng.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getHomepage();

  return (
    <html lang="vi">
      <body className={`${beVietnamPro.className} flex min-h-screen flex-col bg-[#f8f9fa] text-slate-950`}>
        <ToastProvider>
          <SiteHeader />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <MobileBottomNav />
          <SiteFooter settings={payload.settings} />
        </ToastProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/app/layout.tsx
git commit -m "feat(storefront): switch font from Inter to Be Vietnam Pro"
```

---

### Task 3: Wire storefront Tailwind config to shared preset

**Files:**
- Modify: `apps/storefront/tailwind.config.ts`

- [ ] **Step 1: Add shared preset import**

Sửa `apps/storefront/tailwind.config.ts` — thêm `const sharedPreset = require('@repo/shared/tailwind-preset');` và `presets: [sharedPreset]`:

```typescript
import type { Config } from "tailwindcss"

const sharedPreset = require('@repo/shared/tailwind-preset');

const config: Config = {
  presets: [sharedPreset],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a",
        secondary: "#047857",
        accent: "#f97316",
      }
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/tailwind.config.ts
git commit -m "feat(storefront): wire Tailwind to shared preset"
```

---

### Task 4: Update admin layout to use Be Vietnam Pro

**Files:**
- Modify: `apps/admin/app/layout.tsx`

- [ ] **Step 1: Replace Inter import and usage**

Sửa `apps/admin/app/layout.tsx`:

- Dòng 2: `import { Inter } from 'next/font/google';` → `import { Be_Vietnam_Pro } from 'next/font/google';`
- Dòng 6: `const inter = Inter({ subsets: ['latin', 'vietnamese'] });` → `const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'] });`
- Dòng 20: `inter.className` → `beVietnamPro.className`

File sau khi sửa:

```tsx
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';

const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Hùng Hiền Điện Máy - Admin',
  description: 'Trang quản trị bán hàng Hùng Hiền Điện Máy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={beVietnamPro.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/app/layout.tsx
git commit -m "feat(admin): switch font from Inter to Be Vietnam Pro"
```

---

### Task 5: Wire admin Tailwind config to shared preset

**Files:**
- Modify: `apps/admin/tailwind.config.ts`

- [ ] **Step 1: Add shared preset import**

Sửa `apps/admin/tailwind.config.ts` — thêm `const sharedPreset = require('@repo/shared/tailwind-preset');` và `presets: [sharedPreset]`:

```typescript
import type { Config } from "tailwindcss";

const sharedPreset = require('@repo/shared/tailwind-preset');

const config: Config = {
  presets: [sharedPreset],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#001f3f",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#ff4500",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/tailwind.config.ts
git commit -m "feat(admin): wire Tailwind to shared preset"
```

---

### Task 6: Build and verify

- [ ] **Step 1: Build shared package**

```bash
pnpm --filter @repo/shared build
```
Expected: builds successfully (TypeScript compiles existing sources; `tailwind-preset.js` is plain JS, not part of tsc build).

- [ ] **Step 2: Build both apps**

```bash
pnpm --filter storefront build && pnpm --filter admin build
```
Expected: both apps build successfully with no errors.

- [ ] **Step 3: Start dev server to verify visually**

```bash
pnpm dev
```
Open http://localhost:3000 (storefront) and http://localhost:3002 (admin). Verify:
- Text renders in Be Vietnam Pro (not Inter, not system fallback)
- Vietnamese diacritics (ă, â, ê, ô, ơ, ư, đ, tone marks) display correctly
- Heading hierarchy (`text-4xl` through `text-xs`) uses correct sizes and weights
- Form inputs, buttons, selects inherit the font

- [ ] **Step 4: Final commit (if any cleanup needed)**

```bash
git status
git add -A
git commit -m "chore: verify Be Vietnam Pro migration"
```
