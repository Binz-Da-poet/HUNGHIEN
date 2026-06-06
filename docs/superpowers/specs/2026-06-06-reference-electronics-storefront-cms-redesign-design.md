# Reference Electronics Storefront And CMS Redesign - Design Specification

## 1. Goal

Redesign the complete HUNG HIEN system to closely match the supplied electronics retail reference images while adding an admin-managed homepage CMS and basic admin authentication.

The system must deliver:

- A dense, recognizable electronics retail storefront on desktop.
- A close mobile adaptation with prominent search, categories, product cards, and bottom navigation.
- Matching product detail, cart, checkout, and admin visual language.
- Admin-managed homepage content instead of hard-coded storefront sections.
- Basic secure admin login protecting management pages and APIs.

## 2. Chosen Approach

Use a hybrid CMS with fixed content-management screens and an ordered homepage layout manager.

- Each homepage content type has a dedicated admin screen.
- The homepage layout screen controls section visibility and order.
- Banner management supports uploaded finished artwork and dynamic data-driven banners.
- The visual design closely follows the reference images rather than merely borrowing their colors.
- Desktop keeps high information density.
- Mobile preserves the reference structure while keeping controls touch-friendly.

## 3. Visual Identity

The primary identity is HUNG HIEN electronics retail:

- Deep navy is the dominant brand and navigation color.
- Gold/yellow is the primary highlight and promotional accent.
- Red is reserved for price reductions, discounts, and urgent promotions.
- White and very light gray are the main content backgrounds.
- Product imagery remains the visual focus.
- Corners are compact and restrained.
- Borders and subtle shadows separate dense content without making every section look like a floating card.

Typography must support Vietnamese correctly. All existing mojibake user-facing copy must be replaced with valid UTF-8 Vietnamese.

## 4. Storefront Information Architecture

### Desktop Homepage Order

The default desktop homepage follows this structure:

1. Utility bar with hotline, store system, address, login, and cart summary.
2. Main header with logo, search, category selector, and trust/support shortcuts.
3. Product navigation with category menu, product groups, promotions, and contact link.
4. Large homepage banner carousel.
5. Featured category image row.
6. Ordered product groups such as featured, promotions, and best sellers.
7. Service benefit strip.
8. Featured brand strip.
9. Additional trust/service strip.
10. Full footer with store information, policies, contact details, newsletter, and supported payments.

### Mobile Homepage Order

The mobile homepage follows the reference structure:

1. Navy mobile header with menu, logo, search/cart/account actions.
2. Large search field.
3. Banner carousel.
4. Featured category grid, normally four columns.
5. Product groups rendered as two-column grids.
6. Benefit strip adapted for small screens.
7. Featured brand horizontal scroller.
8. Fixed bottom navigation.

Bottom navigation items:

- `Trang chủ`
- `Danh mục`
- `Giỏ hàng`
- `Khuyến mãi`
- `Tài khoản`

Touch controls must be at least approximately 44px where practical.

## 5. Storefront Components

### Header And Search

Desktop uses three navigation levels to closely match the reference:

- Utility information bar.
- Main logo/search/support row.
- Product navigation row.

Mobile uses a compact navy header and a separate prominent search field. The cart icon shows an item-count badge.

Search must continue using the existing product search API. Category selection adds a category filter to the search request.

### Banner Carousel

The carousel supports two banner modes.

Uploaded-artwork mode:

- Desktop image.
- Optional mobile image.
- CTA link.
- Accessible alt text.

Dynamic mode:

- Heading.
- Supporting copy.
- CTA label and link.
- Optional selected products or product images.
- Background color or uploaded background image.

If a mobile image is absent, the desktop image is used with safe responsive cropping.

### Featured Categories

Featured categories display category image, display label, and target category link. Admin controls order and visibility.

Desktop renders a dense horizontal row. Mobile normally renders a four-column grid.

### Product Groups

The homepage can display multiple product groups, including:

- Featured products.
- Promotions.
- Best sellers.
- New products.

Each group has a title, optional icon/accent, selected products, visibility, and display order.

### Product Cards

Product cards closely follow the reference:

- Product image.
- Discount badge.
- Favorite action.
- Product name.
- Rating and optional review count.
- VND selling price.
- Crossed-out original price.
- `Mua ngay` action.

Stock, official-product, and shipping signals can be included when data is available without overcrowding mobile cards.

### Benefit And Brand Strips

Service benefits display an icon, title, and short description. Desktop uses a dense horizontal strip; mobile adapts to a compact scroll or stacked layout.

Featured brands display logo images with optional links and order control.

### Footer

Desktop footer includes:

- Logo and company summary.
- Customer-support links.
- Policy/information links.
- Contact information.
- Newsletter signup presentation.
- Supported payment presentation.

Mobile footer can be reduced because bottom navigation provides primary navigation.

## 6. Other Storefront Pages

Product detail, cart, checkout, and success pages use the same navy/gold/red design system.

### Product Detail

- Product gallery.
- Product title, pricing, discount, stock, and support information.
- Prominent `Thêm vào giỏ` and `Mua ngay`.
- Mobile sticky action bar.

### Cart

- Product image and details.
- Quantity controls.
- VND totals.
- Trust and delivery information.
- Mobile sticky checkout action.

### Checkout

- Clear guest checkout form.
- COD and bank-transfer choices.
- Order summary.
- Inline error handling.
- Navy/gold primary actions.

## 7. Homepage CMS Data Model

### HomepageBanner

Fields:

- `id`
- `name`
- `mode`: `ARTWORK` or `DYNAMIC`
- `desktopImageUrl`
- `mobileImageUrl`
- `altText`
- `heading`
- `description`
- `ctaLabel`
- `ctaUrl`
- `backgroundColor`
- `backgroundImageUrl`
- `isActive`
- `startsAt`
- `endsAt`
- `sortOrder`
- timestamps

Dynamic banners may reference selected products through a banner-product relation.

### HomepageSection

Fields:

- `id`
- `type`
- `title`
- `isActive`
- `sortOrder`
- optional configuration JSON
- timestamps

Supported section types:

- `BANNERS`
- `FEATURED_CATEGORIES`
- `PRODUCT_GROUP`
- `SERVICE_BENEFITS`
- `FEATURED_BRANDS`
- `TRUST_STRIP`

### FeaturedCategory

Fields:

- `id`
- `categoryId`
- `displayName`
- `imageUrl`
- `isActive`
- `sortOrder`

### FeaturedProductGroup

Fields:

- `id`
- `name`
- `slug`
- `title`
- `accent`
- `isActive`
- `sortOrder`
- selected product relations with their own order

### FeaturedBrand

Fields:

- `id`
- `name`
- `logoUrl`
- `targetUrl`
- `isActive`
- `sortOrder`

### StoreBenefit

Fields:

- `id`
- `icon`
- `title`
- `description`
- `isActive`
- `sortOrder`

### StoreSettings

Single-store settings include:

- Hotline.
- Store-system link.
- Address.
- Email.
- Social links.
- Footer company summary.
- Policy/support links.
- Newsletter copy.
- Supported payment labels or images.

## 8. CMS API

### Public Storefront API

`GET /api/storefront/homepage` returns all currently active homepage content in display order.

The response includes:

- Active banners within their schedule.
- Active homepage sections ordered by `sortOrder`.
- Featured categories.
- Active product groups and selected product data.
- Featured brands.
- Store benefits.
- Store settings required by the header and footer.

The endpoint should provide one coherent homepage payload to reduce frontend requests.

### Protected Admin APIs

Protected CRUD APIs manage:

- Banners.
- Homepage sections and order.
- Featured categories.
- Product groups and selected products.
- Brands.
- Benefits.
- Store settings.

Upload endpoints accept banner, category, and brand images. They use the existing storage abstraction so local storage can later move to cloud storage.

## 9. Admin Authentication

Add basic email/password admin authentication.

- Admin passwords are stored only as secure hashes.
- Login creates a server-side-verifiable session represented by an `httpOnly` cookie.
- Session cookie must use secure production settings and an appropriate same-site policy.
- Admin pages redirect unauthenticated users to login.
- Protected management APIs reject unauthenticated requests.
- Public storefront APIs remain readable without login.
- Login errors use a generic invalid-credentials message and do not reveal whether an email exists.
- Expired sessions redirect back to login.

Role-based permissions are out of scope for this pass.

## 10. Admin UX

Admin uses the navy/gold identity but remains operational and scan-friendly.

Navigation:

- Tổng quan
- Sản phẩm
- Danh mục
- Đơn hàng
- Banner
- Bố cục trang chủ
- Nhóm sản phẩm nổi bật
- Thương hiệu
- Cam kết dịch vụ
- Thông tin cửa hàng

### Homepage Layout Manager

The layout manager displays homepage sections as an ordered list.

- Toggle section active/inactive.
- Move sections up/down.
- Edit section title/configuration.
- Preview section type and status.

Free-form drag-and-drop page building is intentionally excluded.

### Banner Manager

Banner manager supports:

- Creating artwork or dynamic banners.
- Uploading desktop/mobile imagery.
- Selecting dynamic-banner products.
- Editing CTA and schedule.
- Activating/deactivating banners.
- Ordering banners.

### Dedicated CMS Screens

Featured categories, product groups, brands, benefits, and store settings each use a dedicated management screen with search where useful, image preview, status controls, order controls, and clear save/error feedback.

### Responsive Admin

- Desktop sidebar.
- Mobile top bar and navigation drawer.
- Desktop tables and mobile card lists.
- Sectioned forms.
- Sticky save action for long mobile forms where needed.

## 11. Data Flow

1. An authenticated administrator updates content through a protected CMS API.
2. The API validates input, stores text/configuration, and saves uploaded images through the storage service.
3. Storefront requests `GET /api/storefront/homepage`.
4. The API filters inactive or out-of-schedule content, resolves selected products, and returns sections in order.
5. Storefront renders sections by type and skips sections that contain no usable content.

Updates become visible after a successful save and the storefront's chosen cache/revalidation period.

## 12. Loading, Empty, And Error Handling

- Broken or absent images use an intentional fallback.
- Sections with no usable content are omitted instead of leaving large empty areas.
- Out-of-schedule banners are not returned by the public API.
- CMS forms preserve entered data on failed save.
- Upload errors state accepted image types and size limits.
- Admin actions show non-blocking success/error feedback.
- Homepage API failure renders a usable fallback storefront shell with search and product discovery where possible.
- Authentication errors remain generic.

## 13. Testing And Verification

### Backend

- Admin password hashing and login.
- Valid/invalid/expired sessions.
- Protected API access.
- CMS CRUD behavior.
- Homepage section activation and ordering.
- Banner schedule filtering.
- Artwork and dynamic banner payloads.
- Aggregate homepage API output.

### Storefront

- Desktop and mobile header structure.
- Search and category filtering.
- Banner rendering and fallbacks.
- Featured categories.
- Ordered product groups.
- Product-card VND pricing and actions.
- Benefit and brand strips.
- Footer and mobile bottom navigation.
- Product detail, cart, and checkout visual consistency.

### Admin

- Login/logout.
- Banner creation and editing.
- Section activation and ordering.
- Product selection for featured groups.
- Brand/category/benefit image management.
- Store-settings update.

### Responsive Visual QA

Verify at approximately:

- 390px mobile.
- Tablet width.
- Standard desktop.
- Wide desktop similar to the supplied reference.

Required checks:

- No unwanted horizontal overflow.
- No incoherent text or control overlap.
- Mobile controls remain easy to tap.
- Desktop remains dense but readable.
- Product imagery stays correctly framed.
- Storefront composition closely resembles the supplied reference images.

## 14. Out Of Scope

- Free-form drag-and-drop page builder.
- Multiple admin roles and permissions.
- Customer accounts and customer login.
- Wishlist persistence.
- Promotion/coupon calculation engine.
- Cloud image storage.
- Multi-store configuration.
