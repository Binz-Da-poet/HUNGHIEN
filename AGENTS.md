# Hùng Hiền Điện Máy

Vietnamese electronics e-commerce platform. Three apps in a pnpm Turborepo monorepo.

## Stack

- **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS 3.4, Zustand 4.5
- **Backend:** NestJS 10, Prisma 5, PostgreSQL
- **Shared:** TypeScript (Zod schemas, VND formatting)
- **Testing:** Vitest 4.1
- **Icons:** Lucide React
- **Package manager:** pnpm 9.0

## Architecture

```
apps/admin/      Next.js :3002 → Admin dashboard (authenticated)
apps/api/        NestJS  :3001 → REST API (/api prefix)
apps/storefront/ Next.js :3000 → Customer website
packages/shared/ TypeScript → @repo/shared (schemas, formatVnd)
```

**Data flow:** Admin → /api/admin/* (session cookie) → CRUD. Storefront → /api/storefront/* + /api/products/* (public) → browse & purchase.

## Conventions

### Visual system
- Navy `#1A2B4C` — headers, buttons, price boxes, dark panels
- Gold `#E5C37A` — CTAs, accents, labels on dark backgrounds
- Red `#D10024` — discount badges, sale prices
- Background: white pages, `#f8fafc` for carts/lists

### Code style
- All UI text in Vietnamese (no English labels in customer-facing UI)
- Tailwind: prefer utility classes, avoid inline styles
- Components: `'use client'` directive where state/effects needed. Server components otherwise.
- NestJS: module → service → controller pattern. Use class-validator DTOs.
- Prisma: one migration approach (`prisma migrate dev`)

### Files
- Next.js pages: `app/<entity>/page.tsx`
- API modules: `src/<domain>/<domain>.module.ts`, `.service.ts`, `.controller.ts`
- Tests: `*.spec.ts` (Vitest) co-located with source

## Constraints

- Do NOT change the technology stack without discussion
- pnpm workspaces with strict dependency resolution (add `express` to deps if needed)
- Storefront homepage fetches CMS via `getHomepage()` ISR. Fallback shows product catalog.
- `.env` must NOT be committed
- Admin routes require `admin_session` cookie (middleware redirects to `/login`)

## Commands

```bash
pnpm --filter @repo/shared test   # Shared package tests
pnpm --filter @repo/shared build  # Build shared package
pnpm --filter api test            # API tests (8 spec files)
pnpm --filter api build           # Build API
pnpm --filter admin build         # Build admin dashboard
pnpm --filter storefront build    # Build storefront
pnpm build                        # Turbo build all
pnpm dev                          # Turbo dev all
pnpm --filter api exec prisma migrate dev   # Run DB migration
pnpm --filter api exec prisma db seed       # Seed database
```

## Key Files

- `apps/api/prisma/schema.prisma` — 14 models (Auth, Catalog, Orders, Homepage CMS)
- `apps/api/src/app.module.ts` — Root module (Auth + Catalog + Orders + Homepage)
- `apps/admin/middleware.ts` — Session protection
- `apps/storefront/app/page.tsx` — CMS-driven homepage with section renderer
- `docs/superpowers/specs/2026-06-07-hung-hien-system-design.md` — Full system reference
