# Reference Redesign Integration And Visual QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the auth/CMS API, admin CMS, and reference storefront; seed usable content; and verify the entire system across desktop and mobile.

**Architecture:** Verify each package first, then run all services together against seeded CMS content. Use browser-based responsive QA to compare storefront composition to the supplied reference and correct only integration or presentation defects.

**Tech Stack:** pnpm, Turborepo, Prisma, NestJS, Next.js, Vitest, browser/Playwright visual QA.

---

### Task 1: Seed Reference-Like CMS Content

**Files:**
- Modify: `apps/api/prisma/seed.ts`

- [ ] Seed artwork/dynamic banner examples using repository public assets.
- [ ] Seed featured categories tied to existing catalog categories.
- [ ] Seed featured, promotion, and best-seller product groups.
- [ ] Seed featured brands, benefits, trust strip, and store settings.
- [ ] Run `pnpm --dir apps/api exec prisma db seed`.
- [ ] Commit with `chore: seed reference storefront cms content`.

---

### Task 2: Run Automated Verification

- [ ] Run `pnpm --filter @repo/shared test`.
- [ ] Run `pnpm --filter api test`.
- [ ] Run `pnpm --filter @repo/shared build`.
- [ ] Run `pnpm --filter api build`.
- [ ] Run `pnpm --filter admin build`.
- [ ] Run `pnpm --filter storefront build`.
- [ ] Fix failures in the owning module and rerun its complete verification.

---

### Task 3: Verify Authentication And CMS End To End

- [ ] Start API on port 3001.
- [ ] Start admin on port 3002.
- [ ] Log in with seeded admin.
- [ ] Create and edit both banner modes.
- [ ] Reorder and toggle homepage sections.
- [ ] Update featured categories, product groups, brands, benefits, and settings.
- [ ] Log out and confirm protected routes redirect to login.

---

### Task 4: Verify Storefront End To End

- [ ] Start storefront on port 3000.
- [ ] Confirm updated CMS content appears after revalidation.
- [ ] Confirm inactive and expired banners remain hidden.
- [ ] Confirm empty sections are omitted.
- [ ] Confirm search/category navigation, buy-now, cart, and checkout still work.
- [ ] Confirm image fallbacks render without layout shift.

---

### Task 5: Perform Responsive Visual QA

Capture and inspect at:

```text
390x844
768x1024
1440x1000
1920x1080
```

Required storefront checks:

- Header structure closely follows the supplied mobile/desktop references.
- Banner, categories, product groups, benefit strip, brands, and footer appear in the configured order.
- Product cards are dense and readable.
- Bottom navigation never covers sticky shopping actions.
- No horizontal overflow or incoherent overlap.

Required admin checks:

- Login and all CMS screens work at mobile and desktop widths.
- Long forms retain visible save actions.
- Tables switch to usable mobile cards.

---

### Task 6: Final Review And Documentation

- [ ] Run `git status --short` and confirm `.env` is not staged.
- [ ] Review changes for unrelated refactors.
- [ ] Run final complete test/build suite.
- [ ] Commit integration-only fixes with `fix: resolve reference redesign integration issues`.
- [ ] Document local URLs and seeded admin setup without committing secrets.

