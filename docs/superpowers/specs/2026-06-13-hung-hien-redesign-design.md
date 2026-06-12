# Hùng Hiền Điện Máy - Redesign (Preserve Mode)

**Date:** 2026-06-13
**Type:** Redesign - Giữ nguyên thương hiệu
**Scope:** Storefront + Shared (Design Tokens)

---

## 0. Design Read

> *"E-commerce điện máy cho người tiêu dùng Việt, với ngôn ngữ cao cấp-tối giản kiểu Apple Store, tập trung vào sản phẩm, whitespace rộng, motion tinh tế."*

### Dial Settings

| Dial | Value | Rationale |
|---|---|---|
| `DESIGN_VARIANCE` | 5 | Sạch sẽ, cân đối, grid đều — không phá cách |
| `MOTION_INTENSITY` | 6 | Chuyển động mượt, tinh tế kiểu Apple |
| `VISUAL_DENSITY` | 2 | Thoáng, gallery-like, sản phẩm là trung tâm |

### Mode

- **Redesign - Preserve**: Giữ màu thương hiệu (navy/gold/red), font Be Vietnam Pro, và cấu trúc thông tin (IA). Nâng cấp: tokens, typography, spacing, motion, dark mode.

---

## 1. Design Tokens (Shared)

Tạo CSS custom properties tập trung trong `packages/shared/tailwind-preset.js`, dùng làm nguồn duy nhất cho cả Storefront và Admin.

### Palette

```css
:root {
  /* Background */
  --background: #f8f9fa;        /* slate-50, nền trang */
  --surface: #ffffff;            /* card, panel */
  --surface-elevated: #f1f5f9;  /* slate-100, nền phụ (cart, sidebar) */

  /* Text */
  --text-primary: #0f172a;      /* slate-900, heading */
  --text-secondary: #475569;    /* slate-600, body */
  --text-tertiary: #94a3b8;     /* slate-400, placeholder, caption */

  /* Border */
  --border: #e2e8f0;            /* slate-200 */

  /* Brand (giữ nguyên) */
  --brand-primary: #1A2B4C;     /* navy - header, footer, CTA */
  --brand-accent: #E5C37A;      /* gold - text trên navy, badge */
  --brand-danger: #D10024;      /* red - discount, sale */
  --brand-success: #16a34a;     /* green-600 - in stock */
}
```

### Typography

- **Font:** Be Vietnam Pro (giữ nguyên), weights: 300, 400, 500, 600, 700, 800
- **Phân cấp mới:**
  - Section title: `text-3xl md:text-4xl font-bold` — KHÔNG uppercase
  - Section subtitle: `text-base text-secondary font-normal max-w-2xl`
  - Product name: `text-sm font-medium text-primary`
  - Price: `text-base font-bold text-danger` (sale) / `text-sm text-tertiary line-through` (gốc)
  - Body text: `font-normal` (thay vì bold hiện tại)

### Border Radius

- Card sản phẩm, panel: `--radius: 1rem` (rounded-2xl)
- Button: `--radius-button: 0.75rem` (rounded-xl)
- Input: `--radius-input: 0.5rem` (rounded-lg)

### Shadows

```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-card-hover: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
--shadow-elevated: 0 10px 40px rgba(0,0,0,0.08);
```

---

## 2. Layout & Spacing

### Section Spacing

| Section | Desktop | Mobile |
|---|---|---|
| Hero/Carousel | `py-0` (full-width) | `py-0` |
| Product sections | `py-20 md:py-28` | `py-12` |
| Brand/Trust strips | `py-12 md:py-16` | `py-8` |

### Hero (Carousel)

- **Giữ nguyên** carousel full-width
- Thêm overlay gradient: `bg-gradient-to-t from-black/40 to-transparent` để CTA nổi
- Chỉ 1 CTA: "Xem ngay" (button navy/gold)
- Indicator: pill-shape dots, animate width khi active
- Không có text phụ — ảnh nói thay lời

### Product Card

- Bỏ shadow mặc định, thêm shadow khi hover
- Ảnh sản phẩm chiếm ~85% card height
- Info: 2 dòng (tên + giá), font-size nhỏ gọn
- Badge discount: nhỏ, đặt góc trái trên, `rounded-md`
- `rounded-2xl` đồng nhất
- Hover: `scale: 1.02` + shadow mượt

### Header

- **Đơn giản hóa 1 hàng:** Logo | Search | Cart
- Bỏ utility bar trên cùng (navy)
- Menu danh mục → dropdown từ nút "Danh mục"
- Sticky header: `backdrop-blur-md bg-white/80` + `shadow-sm` khi scroll > 80px
- Transition mượt khi sticky/unsticky

### Mobile Bottom Nav

- Giữ nguyên 5 icon links
- Tinh chỉnh: icon stroke width `1.5`, active state màu navy

### Footer

- Nền navy giữ nguyên
- 3 cột: Thông tin công ty | Hỗ trợ khách hàng | Liên hệ
- Thêm form email đăng ký nhận tin (input + button, gold accent)
- Social icons nhỏ hơn, tinh tế

### Admin (Out of Scope - Phase 2)

- Admin giữ nguyên layout hiện tại
- Chỉ hưởng lợi từ shared design tokens

---

## 3. Motion (motion/react)

### 3.1 Page Load

- Hero banner: fade in (`opacity: 0 → 1`, `y: 16 → 0`, duration 0.7s, ease-out)
- CTA: fade in sau 200ms delay

### 3.2 Scroll Reveal

- Product grid: mỗi card `opacity: 0, y: 24 → opacity: 1, y: 0`
- Stagger delay 80ms giữa các card
- `whileInView`, `viewport: { once: true, amount: 0.2 }`
- Duration 0.5s, ease `[0.16, 1, 0.3, 1]`

### 3.3 Product Card Hover

- `scale: 1.02`, shadow xuất hiện
- Transition 0.3s, ease-out

### 3.4 Carousel

- Slide transition: spring (`stiffness: 300, damping: 30`)
- Indicator pill-width animate

### 3.5 Header Sticky

- Background blur + shadow xuất hiện dần khi scroll > 80px
- Logo thu nhỏ nhẹ

### 3.6 Micro-interactions

- Cart badge: spring scale khi số lượng thay đổi
- Button: `scale: 0.97` khi `:active`

### 3.7 Skeleton Loading

- Shimmer effect (gradient animation) thay pulse

### 3.8 Reduced Motion

- Tất cả animation tôn trọng `prefers-reduced-motion`
- Motion: dùng `useReducedMotion()` → instant
- CSS: gated behind `@media (prefers-reduced-motion: no-preference)`

---

## 4. Dark Mode (Future — không triển khai ngay)

- Dự phòng cấu trúc: Tailwind `dark:` variant trên mọi component mới
- Khi triển khai: palette dark tương ứng (navy backgrounds, gold text, slate text)
- Respect `prefers-color-scheme` với toggle thủ công

---

## 5. Implementation Plan

### Phase 1: Design Tokens (Shared)

1. Cập nhật `packages/shared/tailwind-preset.js`:
   - Thêm `colors` với tất cả token
   - Thêm `borderRadius` tokens
   - Giữ fontFamily, fontSize hiện có
2. Cập nhật `apps/storefront/tailwind.config.ts` và `apps/admin/tailwind.config.ts`:
   - Xóa `colors` override cũ
   - Dùng `preset` từ shared
   - Bật `darkMode: 'class'`
3. Cập nhật `globals.css` cả hai app: CSS variables

### Phase 2: Typography + Spacing (Storefront)

4. Refactor header: 1 hàng, sticky, dropdown menu
5. Refactor footer: 3 cột, email form
6. Refactor product card: spacing, typography, radius, hover
7. Refactor homepage sections: spacing, typography
8. Refactor all components: thay hex cứng → token (brand-primary, brand-accent, etc.)

### Phase 3: Motion (Storefront)

9. Cài đặt `motion` package
10. Hero fade-in
11. Scroll reveal cho product sections
12. Card hover animation
13. Carousel indicator animation
14. Header sticky transition
15. Cart badge animation
16. Skeleton shimmer

### Phase 4: Polish

17. Mobile responsiveness audit
18. Empty/loading/error states audit
19. Lighthouse performance check
20. Accessibility audit (contrast, focus states, reduced motion)

---

## 6. Explicitly NOT Changing

- URL structure / routes
- Nav labels
- Form field names
- Brand logo
- Content (sản phẩm, danh mục, banner trong DB)
- Admin layout (phase 2 sau)

---

## 7. Success Criteria

- [ ] Mọi màu sắc dùng design tokens, không còn hex cứng
- [ ] Shared preset dùng chung cho storefront và admin
- [ ] Typography có phân cấp rõ (heading bold, body normal)
- [ ] Product card "thở" hơn, ảnh là trung tâm
- [ ] Header 1 hàng, sticky mượt
- [ ] Footer gọn hơn, có email form
- [ ] Motion tinh tế (fade, reveal, hover), không giật
- [ ] Reduced motion hoạt động
- [ ] Lighthouse LCP < 2.5s, CLS < 0.1
- [ ] Không có em-dash trong UI
- [ ] Không có hex cứng trong component
- [ ] Mobile responsive không hỏng layout
