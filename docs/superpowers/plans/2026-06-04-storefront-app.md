# Storefront Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the user-facing Next.js storefront application allowing customers to view products and place guest orders.

**Architecture:** Next.js 14 App Router, TailwindCSS, Shadcn UI. State management for the shopping cart will be handled using Zustand (local storage persistence). Data will be fetched directly from the NestJS API (`http://localhost:3001/api`).

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, Zustand, Lucide React, Zod.

---

### Task 1: Storefront App Scaffolding

**Files:**
- Create: `apps/storefront/package.json`
- Create: `apps/storefront/tsconfig.json`
- Create: `apps/storefront/postcss.config.js`
- Create: `apps/storefront/tailwind.config.ts`
- Create: `apps/storefront/app/layout.tsx`
- Create: `apps/storefront/app/globals.css`
- Modify: `turbo.json` (Ensure `storefront` is included in dev script if not already)

- [ ] **Step 1: Create package.json for storefront**
```json
{
  "name": "storefront",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
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
    "zustand": "^4.5.2",
    "@repo/shared": "workspace:*"
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

- [ ] **Step 2: Create config files (tsconfig, tailwind, postcss, globals.css)**
*Use standard Next.js Tailwind configurations. Add shared UI utility `cn` in `apps/storefront/lib/utils.ts`.*

- [ ] **Step 3: Create basic layout with Header and Footer**
`apps/storefront/app/layout.tsx` should include a generic Navbar (Logo, Links, Cart Icon) and Footer.

- [ ] **Step 4: Install dependencies and Commit**
Run: `pnpm install`
```bash
git add apps/storefront
git commit -m "chore: scaffold storefront application"
```

---

### Task 2: Cart State Management (Zustand)

**Files:**
- Create: `apps/storefront/store/use-cart.ts`

- [ ] **Step 1: Implement Cart Store**
Create a Zustand store with `persist` middleware to save cart items in `localStorage`.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.productId === item.productId);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

- [ ] **Step 2: Commit**
```bash
git add apps/storefront/store
git commit -m "feat: implement zustand cart store with local storage persistence"
```

---

### Task 3: Product Listing and Details

**Files:**
- Create: `apps/storefront/app/page.tsx`
- Create: `apps/storefront/app/products/[id]/page.tsx`
- Create: `apps/storefront/components/product-card.tsx`

- [ ] **Step 1: Implement ProductCard Component**
A reusable UI component displaying product image, name, price, and an "Add to Cart" button that triggers the Zustand store.

- [ ] **Step 2: Implement Home Page (Product Listing)**
Fetch products from `/api/products` (Server Component or `useEffect` on Client) and render a grid of `ProductCard`s.

- [ ] **Step 3: Implement Product Details Page**
Fetch a single product by ID. Display detailed information, stock status, and add to cart functionality.

- [ ] **Step 4: Commit**
```bash
git add apps/storefront/app/page.tsx apps/storefront/app/products apps/storefront/components
git commit -m "feat: implement product listing and details pages"
```

---

### Task 4: Cart and Checkout Flow

**Files:**
- Create: `apps/storefront/app/cart/page.tsx`
- Create: `apps/storefront/app/checkout/page.tsx`
- Create: `apps/storefront/app/checkout/success/page.tsx`

- [ ] **Step 1: Implement Cart Page**
Read items from `useCart`. Display list with quantity controls, subtotal, and a "Proceed to Checkout" button.

- [ ] **Step 2: Implement Checkout Form Page**
A form collecting Customer Name, Phone, Address, Note, and Payment Method.
On Submit:
1. Construct payload matching backend `CreateOrderDto`.
2. POST to `/api/orders`.
3. If successful: `clearCart()` and redirect to `/checkout/success`.

- [ ] **Step 3: Implement Success Page**
A simple "Thank you for your order" message with a button to return to home.

- [ ] **Step 4: Commit**
```bash
git add apps/storefront/app/cart apps/storefront/app/checkout
git commit -m "feat: implement cart and checkout flow"
```