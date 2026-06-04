# Mobile Commerce UI/UX Redesign - Design Specification

## 1. Goal

Upgrade the HUNG HIEN admin and storefront into a modern, trustworthy, mobile-first e-commerce experience for Vietnamese customers and shop operators.

The redesign must make buying easier on phones, make admin operations usable on phones, fix broken Vietnamese text, standardize prices as VND, and add product image upload/gallery support so products feel real and credible.

## 2. Chosen Approach

Use the "mobile commerce redesign plus product images" approach.

This means:

- Redesign storefront and admin together around one visual system.
- Prioritize mobile usability while keeping desktop efficient.
- Add local product image upload now, with storage architecture that can move to cloud later.
- Support real product images when present and polished fallback placeholders when missing.
- Add both "Add to cart" and "Buy now" purchase paths.
- Use Vietnamese copy and VND formatting throughout.

## 3. Current Problems To Solve

- Vietnamese UI strings are mojibake in several files.
- Prices are displayed as USD instead of VND.
- Storefront product cards and details use plain placeholders instead of product images.
- Storefront mobile flows rely on basic pages and browser alerts.
- Cart and checkout are usable but not optimized for thumb-friendly mobile purchase.
- Admin uses a fixed desktop sidebar and table-heavy views that are poor on mobile.
- Admin dashboard uses English sample data instead of useful Vietnamese operational shortcuts.
- Error, loading, and empty states are inconsistent.

## 4. Visual Direction

The visual direction is modern, trustworthy, and sales-focused.

- Use a light, clean interface with strong readability.
- Use navy or dark green as the main trust color.
- Use orange only for important commerce actions such as "Buy now", checkout, and primary save actions.
- Use restrained borders, compact radii, clear spacing, and lucide icons for actions.
- Avoid decorative clutter, heavy marketing blocks, and UI that hides products behind oversized sections.
- Keep all mobile text readable without zooming or horizontal scrolling.

## 5. Product Image Architecture

### Data Model

Add or complete a product image model with these fields:

- `id`
- `productId`
- `url`
- `altText`
- `sortOrder`
- `isPrimary`
- `createdAt`
- `updatedAt`

Each product can have many images. One image should be primary when images exist.

### Storage

Use local upload storage first.

- Store uploaded images under an API-served uploads path such as `/uploads/products/...`.
- Return public URLs that both admin and storefront can render directly.
- Isolate storage behavior behind a service such as `ImageStorageService`.
- Keep the service interface cloud-friendly so future Cloudinary, S3, or R2 storage can replace local storage without redesigning UI or product APIs.

### API

Product APIs should return image data with products.

Implement these endpoints:

- `POST /api/products/:id/images` uploads one or more images.
- `PATCH /api/products/:id/images/:imageId` updates image metadata such as `altText`, `sortOrder`, or `isPrimary`.
- `DELETE /api/products/:id/images/:imageId` removes an image.

When a primary image is deleted, the backend should select the next available image as primary. If no image remains, the product uses the storefront/admin fallback image UI.

## 6. Storefront UX

### Layout

The storefront should be mobile-first.

- Mobile header includes logo, search entry, cart icon with badge, and a compact navigation/menu pattern.
- Desktop header remains simple and scan-friendly.
- Home page starts with useful commerce controls: search, categories, and featured products.
- Product grids use stable image aspect ratios so loading or missing images do not shift layout.

### Product Cards

Product cards should show:

- Primary product image if available.
- Polished fallback placeholder if no image exists.
- Product name clamped to two lines.
- Brand or category badge where available.
- VND price, with original price crossed out when available.
- Stock status.
- Two actions: `Thêm giỏ` and `Mua ngay`.

The current browser `alert` feedback should be replaced with non-blocking UI feedback such as a toast or bottom feedback message.

### Product Details

The product detail page should include:

- Image gallery with primary image and thumbnails.
- Fallback gallery state when no images exist.
- Brand, product name, VND price, original price, stock, warranty/support notes, and description.
- Mobile sticky purchase bar with `Thêm giỏ` and `Mua ngay`.

### Cart

Mobile cart should use item cards rather than dense table-like rows.

Each cart item should include image/fallback, name, price, quantity controls, remove action, and line total. The order summary should stay easy to reach, with a sticky checkout action on mobile.

### Checkout

Checkout should stay guest-first and short.

Fields:

- Customer name.
- Phone number.
- Delivery address.
- Optional note.
- Payment method: COD or bank transfer.

The checkout submit action should be prominent and thumb-friendly. Validation errors and API errors should be shown inline or in a clear error banner, not only in alerts.

### Buy Now

`Mua ngay` should create a fast path from product card or detail to checkout for one product.

Use a dedicated single-item buy-now checkout session, stored separately from the normal cart. It must not destroy or mutate the user's existing cart.

## 7. Admin UX

### Layout

Admin should use a responsive shell.

- Desktop keeps a sidebar for efficient navigation.
- Mobile uses a top bar with a menu button and navigation drawer.
- Main content uses smaller mobile padding and avoids horizontal overflow.
- Vietnamese labels should replace current broken text and English sample labels.

### Dashboard

The dashboard should focus on operational shortcuts and real status.

Include quick actions:

- `Thêm sản phẩm`
- `Xem đơn hàng`
- `Quản lý danh mục`
- `Sản phẩm sắp hết hàng`

KPI cards can be shown when API data exists. If real data is unavailable, use clear empty states rather than fake English metrics.

### Products

Products should be displayed responsively.

- Desktop: compact table for scanning.
- Mobile: card list with thumbnail, name, VND price, stock, status, edit action, and delete action.

The product page should include mobile-friendly search and filter controls for name, category, and stock status. The layout must not require horizontal scrolling.

### Product Form And Images

Product forms should be broken into clear sections:

- Basic information.
- Category.
- Price and stock.
- Description/specifications.
- Product images.

The image section should support:

- Uploading multiple local image files.
- Preview grid.
- Primary image selection.
- Deleting images.
- Clear error display for failed uploads.
- Keeping product form data intact when one image upload fails.

### Orders

Orders should be responsive.

- Desktop: table for scan speed.
- Mobile: card list with order code, customer, phone, date, total VND, status, and status update control.
- Status filter should be a full-width mobile control or segmented control.
- Status updates should show success/error feedback and refetch or rollback when an update fails.

### Categories

Categories should follow the same responsive pattern.

- Desktop table.
- Mobile card list.
- Add/edit dialog or sheet must fit mobile height and not overflow awkwardly.

## 8. Formatting And Copy

- All user-facing text should be valid Vietnamese.
- HTML language should be `vi`.
- Use VND formatting everywhere prices are displayed, for example `12.500.000₫`.
- Move repeated formatting into shared utilities where practical.
- Avoid mixed English/Vietnamese in user-facing UI unless a technical status code is intentionally shown to admins.

## 9. Loading, Empty, And Error States

Storefront and admin should use consistent states:

- Loading skeletons or stable loading blocks.
- Empty states with a next action.
- Error banners for API failures.
- Toast or inline feedback for short operations.

Upload-specific rules:

- Accept only valid image MIME types.
- Enforce a practical file size limit.
- Show a clear error when upload fails.
- Do not leave products with broken image references in the UI.

Checkout-specific rules:

- Show clear messages for missing fields, API errors, out-of-stock products, or insufficient quantity.
- Keep the customer's entered form values when submission fails.

## 10. Testing And Verification

Backend verification:

- Product image schema and API behavior.
- Valid image upload.
- Reject non-image upload.
- Primary image assignment.
- Primary image deletion fallback.
- Product API returns image gallery.

Frontend verification:

- Storefront home, product detail, cart, checkout, add-to-cart, and buy-now paths.
- Admin dashboard, products, product form image upload, categories, orders, and status updates.
- Vietnamese text renders correctly.
- Prices render as VND.
- Real images render when available.
- Fallback image UI renders when no image exists.

Responsive verification:

- Mobile viewport around 390px.
- Tablet viewport.
- Desktop viewport.

The UI must have no unwanted horizontal scrolling, no incoherent text overlap, stable image framing, visible primary CTAs, and usable admin controls on mobile.

## 11. Out Of Scope For This Pass

- Cloud image storage integration.
- Admin authentication redesign.
- Customer accounts and order history.
- Coupons and promotions engine.
- Full analytics dashboard.
- Advanced product comparison.

These can be added later without changing the core product image and mobile-first UI architecture.
