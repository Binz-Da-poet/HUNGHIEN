# E-commerce Platform - Plan 3: Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai giao diện quản trị (Admin Dashboard) để quản lý Danh mục, Sản phẩm và Đơn hàng.

**Architecture:** Sử dụng Next.js (App Router) kết hợp Tailwind CSS và Shadcn UI. Giao tiếp với API NestJS thông qua các Server Actions hoặc Client-side fetch.

**Tech Stack:** Next.js 14, Tailwind CSS, Shadcn UI, Lucide React, React Hook Form, Zod.

---

### Task 1: Admin App Scaffolding & Layout

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/app/layout.tsx`
- Create: `apps/admin/app/page.tsx`
- Create: `apps/admin/components/layout/sidebar.tsx`

- [ ] **Step 1: Khởi tạo package.json cho Admin**
```json
{
  "name": "admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.378.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.0.1"
  }
}
```

- [ ] **Step 2: Tạo layout cơ bản với Sidebar điều hướng**
- [ ] **Step 3: Commit**
```bash
git add apps/admin
git commit -m "chore: scaffold admin application and base layout"
```

---

### Task 2: Quản lý Danh mục (Category Management)

**Files:**
- Create: `apps/admin/app/categories/page.tsx`
- Create: `apps/admin/components/categories/category-table.tsx`
- Create: `apps/admin/components/categories/category-form.tsx`

- [ ] **Step 1: Triển khai bảng hiển thị danh sách Categories**
- [ ] **Step 2: Triển khai Form thêm/sửa Category (sử dụng Dialog/Modal)**
- [ ] **Step 3: Kết nối API (fetch, create, update, delete)**
- [ ] **Step 4: Commit**
```bash
git add apps/admin
git commit -m "feat: implement category management ui"
```

---

### Task 3: Quản lý Sản phẩm (Product Management)

**Files:**
- Create: `apps/admin/app/products/page.tsx`
- Create: `apps/admin/components/products/product-table.tsx`
- Create: `apps/admin/app/products/new/page.tsx`

- [x] **Step 1: Triển khai bảng Sản phẩm với tìm kiếm và lọc theo danh mục**
- [x] **Step 2: Triển khai trang tạo mới sản phẩm (Form phức tạp với JSON specs)**
- [x] **Step 3: Kết nối API Product (CRUD)**
- [x] **Step 4: Commit**
```bash
git add apps/admin
git commit -m "feat: implement product management ui"
```

---

### Task 4: Quản lý Đơn hàng (Order Management)

**Files:**
- Create: `apps/admin/app/orders/page.tsx`
- Create: `apps/admin/components/orders/order-list.tsx`
- Create: `apps/admin/components/orders/order-status-badge.tsx`

- [x] **Step 1: Triển khai danh sách đơn hàng (Phân trang, Lọc trạng thái)**
- [x] **Step 2: Triển khai tính năng cập nhật trạng thái đơn hàng (Dropdown)**
- [x] **Step 3: Commit**
```bash
git add apps/admin
git commit -m "feat: implement order management ui"
```
