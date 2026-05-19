# E-Commerce Platform Phase 1 (MVP) - Design Specification

## 1. Project Overview
A unified e-commerce and offline showroom platform for Electronics, Furniture, and Appliances. 
**Goal:** Customers can easily find products, compare them, trust the brand, and seamlessly place an order or visit the physical store.

## 2. UI/UX Design & Branding
- **Tone:** Modern, clean, trustworthy.
- **Colors:** Navy Blue/Dark Green (Primary), Orange/Red (Accent for sales), White/Light Gray (Background).
- **Mobile-first approach:** Optimized for mobile viewing, fast loading, bottom-sheet menus.
- **Minimalist:** No intrusive popups. Focus on facets (filters) and clear product cards.

## 3. Architecture Overview
- **Monorepo (Turborepo)**
  - `/apps/storefront`: Next.js (App Router), TailwindCSS, Shadcn UI.
  - `/apps/admin`: Next.js (App Router), TailwindCSS, Shadcn UI.
  - `/apps/api`: NestJS.
  - `/packages/shared`: Shared TS Interfaces, DTOs, Zod validations.
- **Database:** PostgreSQL accessed via Prisma ORM.

## 4. Phase 1 Features (MVP Scope)
### Storefront (Customer Facing)
- **Home Page:** Search, Hero Banners, Promoted Categories, Featured/Sale items.
- **Product List:** Advanced Filtering (Price, Brand, Specs) and Sorting.
- **Product Detail:** Image gallery, Specs, Stock availability, Warranty info, "Buy Now" and "Add to Cart".
- **Cart & Checkout (Guest Only):** No mandatory account creation. Simple checkout flow (Info -> Payment -> Confirm).
- **Payment Methods:** COD (Cash on Delivery) and Bank Transfer.
- **Support:** Zalo/LINE chat widget integration.

### Admin Dashboard
- **Authentication:** Secure login for administrators.
- **Catalog Management:** Manage Categories and Products (CRUD, Images, Specs, Stock).
- **Order Management:** View, update order status (Pending, Shipping, Completed, Cancelled).
- **Banner Management:** Update homepage hero banners.

## 5. Data Flow (Guest Checkout)
1. **Cart Storage:** Handled purely on the client-side via LocalStorage / Zustand.
2. **Checkout:** User inputs delivery details and selects payment method.
3. **Submission:** `POST /api/orders` sends cart items and user details.
4. **Validation:** NestJS validates payload, checks inventory, deducts stock, and creates order with `PENDING` status.
5. **Confirmation:** Storefront clears local cart and redirects to Order Success page.

## 6. Database Schema (Core MVP)
- **AdminUser:** id, email, passwordHash, name.
- **Category:** id, name, slug, parentId.
- **Product:** id, categoryId, name, slug, description, price, originalPrice, brand, stock, specs (JSON), status.
- **ProductImage:** id, productId, url, isPrimary.
- **Order:** id, customerName, phone, address, note, totalAmount, paymentMethod, status, createdAt.
- **OrderItem:** id, orderId, productId, quantity, priceAtPurchase.

## 7. Future Phases (Out of Scope for Phase 1)
- User Authentication & Order History
- Product Comparison Tool
- Discount Coupons
- Advanced Analytics / Reports
- AI Recommendations & AR Previews
