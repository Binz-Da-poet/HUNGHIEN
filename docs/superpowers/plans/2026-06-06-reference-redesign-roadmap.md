# Reference Electronics Redesign Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coordinate the approved reference-driven storefront redesign, homepage CMS, admin CMS screens, and basic admin authentication through independently testable phases.

**Architecture:** Build the protected CMS API first, then its admin management UI, then replace the storefront homepage shell with the reference composition, and finish with cross-system verification. Existing uncommitted admin/storefront redesign work must be preserved and incorporated rather than reverted.

**Tech Stack:** Turborepo, pnpm, Next.js 14 App Router, React 18, Tailwind CSS, NestJS 10, Prisma, PostgreSQL, Vitest, Zustand, Lucide React.

---

## Execution Order

1. Execute [Admin Auth And Homepage CMS API](./2026-06-06-admin-auth-homepage-cms-api.md).
2. Execute [Admin Homepage CMS UI](./2026-06-06-admin-homepage-cms-ui.md).
3. Execute [Reference Storefront Redesign](./2026-06-06-reference-storefront-redesign.md).
4. Execute [Reference Redesign Integration And Visual QA](./2026-06-06-reference-redesign-integration-qa.md).

## Existing Work Protection

- [ ] Before implementation, create or enter an isolated worktree from the latest intended base.
- [ ] Inspect the current dirty checkout with `git status --short` and `git diff --stat`.
- [ ] Preserve the existing uncommitted admin/storefront redesign files; do not reset or overwrite them.
- [ ] Bring those changes into the implementation worktree intentionally before editing overlapping UI files.
- [ ] Keep `.env` untracked and never stage it.

## Completion Criteria

- [ ] Basic admin login protects all management pages and management APIs.
- [ ] Admin can manage all homepage content and section order.
- [ ] Storefront renders the active CMS payload in the reference layout.
- [ ] Product detail, cart, checkout, and admin use the navy/gold visual system.
- [ ] Backend tests and all package builds pass.
- [ ] Mobile, tablet, standard desktop, and wide desktop visual QA pass.

