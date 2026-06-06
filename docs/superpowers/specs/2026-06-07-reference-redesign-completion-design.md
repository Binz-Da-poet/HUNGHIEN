# Reference Redesign Completion Design

**Date:** 2026-06-07

## Context

The reference redesign roadmap covers 4 phases. Phases 1–3 are essentially complete (~95%). Phase 4 (Integration & Visual QA) is structurally in place. This design covers the remaining gaps and finalization.

## Remaining Gaps Identified

1. **`auth.controller.spec.ts` missing** — Phase 1, Task 2. AuthService had tests but AuthController did not.
2. **`express` not in `apps/api` dependencies** — Vitest cannot resolve `Request`/`Response` from `express` in the controller under pnpm strict mode, even though NestJS resolves it at runtime.

## Approach

### 1. Add `express` to API dependencies

`express` is a peer dependency of `@nestjs/platform-express` and used directly in `auth.controller.ts` for type annotations. Adding it to `dependencies` fixes vitest resolution.

### 2. Write `auth.controller.spec.ts`

Six test cases covering login (cookie set, error propagation), logout (cookie clear with/without token), and me endpoint (decorator return, guard applied). Uses Vitest + NestJS testing module with mocked AuthService.

### 3. Verification

Run full build/test suite across all packages:
- `@repo/shared` — build + test
- `api` — build + test
- `admin` — build
- `storefront` — build

## Files Changed

| File | Action |
|---|---|
| `apps/api/package.json` | Add `express` dependency |
| `apps/api/src/auth/auth.controller.spec.ts` | Create — 6 test cases |

## What Remains (Manual / Phase 4)

Phase 4 tasks are manual verification:
- Start all three services and test login → CMS CRUD → storefront rendering
- Responsive visual QA at 390px, 768px, 1440px, 1920px
- Confirm `.env` is not staged
