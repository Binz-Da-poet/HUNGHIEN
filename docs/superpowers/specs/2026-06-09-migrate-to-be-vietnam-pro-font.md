# Migrate Font System from Inter to Be Vietnam Pro

> Date: 2026-06-09 | Status: Draft

## Summary

Replace Inter with Be Vietnam Pro across both frontend apps (storefront and admin). Introduce a shared Tailwind preset in `@repo/shared` to define `fontFamily` and a tuned `fontSize` scale. Use variable font via `next/font/google`.

## Motivation

- **Be Vietnam Pro** is designed by Vietnamese designers specifically for Vietnamese diacritics — better legibility for the target audience.
- Inter is a generic sans-serif; Be Vietnam Pro gives the brand a distinctive regional identity.
- Centralizing typography in a shared Tailwind preset ensures both apps stay in sync and future apps can adopt the same scale instantly.

## Design Decisions

| Decision | Rationale |
|---|---|
| Shared Tailwind preset (`@repo/shared/tailwind-preset.js`) | DRY; single source of truth for both apps; natural fit for Turborepo monorepo |
| Variable font via `next/font/google` | Same approach as current Inter; supports full weight range 100–900 without multiple imports |
| No Inter in font stack fallback | Clean break; standard system-ui fallback is sufficient |
| JS preset file (not TS) | Tailwind resolves via `require()`; avoids ESM/CJS mismatch and build dependency on shared package |
| Typography scale tuned for Be Vietnam Pro | Higher x-height needs wider line-height (~10–15% more than Tailwind default); heading weights bumped to 600–800 for visual hierarchy |

## Files Changed

### New file (1)

**`packages/shared/tailwind-preset.js`** — export object with `fontFamily` and `fontSize`:

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
        xs:   ['0.75rem',  { lineHeight: '1rem' }],        // 12px — caption, badge
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],      // 14px — helper text, form label
        base: ['1rem',     { lineHeight: '1.625rem' }],     // 16px — body
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],      // 18px — large body, card desc
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],      // 20px — h4
        '2xl': ['1.5rem',  { lineHeight: '2rem' }],         // 24px — h3
        '3xl': ['1.875rem',{ lineHeight: '2.25rem' }],      // 30px — h2
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],      // 36px — h1
        '5xl': ['3rem',    { lineHeight: '1.1' }],          // 48px — hero
        '6xl': ['3.75rem', { lineHeight: '1.1' }],          // 60px — hero large
      },
    },
  },
};
```

### Modified files (4)

**`apps/storefront/app/layout.tsx`**
- Line 3: `import { Inter }` → `import { Be_Vietnam_Pro }`
- Line 10: `const inter = Inter({ subsets: ['latin', 'vietnamese'] })` → `const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'] })`
- Line 26: `${inter.className}` → `${beVietnamPro.className}`

**`apps/admin/app/layout.tsx`**
- Line 2: `import { Inter }` → `import { Be_Vietnam_Pro }`
- Line 6: `const inter = Inter({ subsets: ['latin', 'vietnamese'] })` → `const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'] })`
- Line 20: `inter.className` → `beVietnamPro.className`

**`apps/storefront/tailwind.config.ts`**
- Add `const sharedPreset = require('@repo/shared/tailwind-preset');`
- Add `presets: [sharedPreset]` to config object

**`apps/admin/tailwind.config.ts`**
- Add `const sharedPreset = require('@repo/shared/tailwind-preset');`
- Add `presets: [sharedPreset]` to config object

### Unchanged files

- `apps/storefront/app/globals.css` — body already uses Tailwind utilities; form elements use `font: inherit` which inherits from body.
- `apps/admin/app/globals.css` — same.
- `packages/shared/package.json` — no need to add subpath exports; Node resolves `.js` files directly via `require`.

## Typography Scale Reference

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `xs` | 12px (0.75rem) | 16px (1rem) | 400 | Caption, badge |
| `sm` | 14px (0.875rem) | 20px (1.25rem) | 400 | Helper text, form label |
| `base` | 16px (1rem) | 26px (1.625rem) | 400 | Body text |
| `lg` | 18px (1.125rem) | 28px (1.75rem) | 400 | Large body, card description |
| `xl` | 20px (1.25rem) | 28px (1.75rem) | 600 | h4 heading |
| `2xl` | 24px (1.5rem) | 32px (2rem) | 600 | h3 heading |
| `3xl` | 30px (1.875rem) | 36px (2.25rem) | 700 | h2 heading |
| `4xl` | 36px (2.25rem) | 44px (2.75rem) | 700 | h1 heading |
| `5xl` | 48px (3rem) | 1.1 ratio | 800 | Hero title |
| `6xl` | 60px (3.75rem) | 1.1 ratio | 800 | Hero title large |

## Post-Migration Verification

1. Run `pnpm dev` — both storefront (:3000) and admin (:3002) start without errors.
2. Visual check: font renders as Be Vietnam Pro, diacritics display correctly.
3. Visual check: heading hierarchy is clear (size + weight + line-height).
4. Visual check: form inputs, buttons, selects, textareas inherit the font correctly.
5. Run `pnpm build` — both apps build successfully.
