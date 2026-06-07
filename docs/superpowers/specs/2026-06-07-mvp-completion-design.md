# Hùng Hiền Điện Máy - MVP Completion Design

**Date:** 2026-06-07  
**Status:** Approved design  
**Goal:** Hoàn thiện MVP bán hàng không cần tài khoản khách hàng, đủ an toàn và ổn định để vận hành trên một VPS riêng.

---

## 1. Scope

MVP phải hỗ trợ trọn vẹn các luồng:

1. Khách xem danh mục, tìm kiếm, xem sản phẩm và đặt hàng không cần đăng nhập.
2. Khách thanh toán COD hoặc chuyển khoản thủ công bằng thông tin/QR của cửa hàng.
3. Khách tra cứu đơn bằng mã đơn và số điện thoại.
4. Admin quản lý danh mục, sản phẩm, tồn kho, đơn hàng, thanh toán, homepage CMS, tin tức và chính sách.
5. Hệ thống chạy trên một VPS với PostgreSQL, upload ảnh trên ổ đĩa và reverse proxy.

Không thuộc MVP:

- Tài khoản khách hàng, lịch sử đơn theo tài khoản.
- Danh sách yêu thích.
- Trung tâm thông báo.
- Đánh giá sản phẩm thật.
- Thanh toán trực tuyến tự động hoặc đối soát ngân hàng tự động.
- Hẹn giờ tự động xuất bản/gỡ bài.

Các mục chưa thuộc MVP phải được ẩn khỏi điều hướng và giao diện, không để link chết hoặc nút giả.

---

## 2. Current-State Findings

### 2.1 Critical and high-priority findings

- Next.js `14.2.3` có dependency production mức critical/high, gồm lỗ hổng bypass middleware trong khi admin dựa vào middleware để bảo vệ route.
- `.env` đang được Git theo dõi và từng chứa `DATABASE_URL`.
- Nhiều trang admin dùng `fetch` trực tiếp không kèm `credentials: 'include'`; request từ admin `:3002` sang API `:3001` có thể mất cookie phiên và trả `401`.
- Luồng đặt hàng kiểm tra tồn kho rồi giảm kho bằng hai thao tác riêng, có thể bán vượt tồn khi nhiều đơn đồng thời.
- Hủy đơn không hoàn tồn kho.
- API storefront trả cả sản phẩm không hoạt động và chưa giới hạn/phân trang hợp lý.
- Upload dùng memory storage nhưng chưa giới hạn kích thước tại Multer trước khi file được giữ trong RAM.

### 2.2 Functional gaps

- Chưa có tra cứu đơn cho khách.
- Chuyển khoản chưa hiển thị QR/thông tin thanh toán sau đặt hàng.
- Chưa có trạng thái thanh toán tách biệt với trạng thái giao hàng.
- Dashboard tính doanh thu từ tập đơn gần nhất thay vì dữ liệu tổng hợp chính xác.
- Storefront có link tới các route chưa tồn tại như danh mục tổng, tra cứu đơn, tin tức, chính sách, tài khoản và thông báo.
- Rating và số lượng đã bán đang là dữ liệu giả lập.
- CMS chưa có tin tức và chính sách.
- Một số ảnh CMS upload nội bộ chưa được resolve sang URL API đầy đủ.

### 2.3 Quality and operations gaps

- Frontend chưa có test tự động.
- `pnpm lint` chưa chạy không tương tác vì storefront thiếu cấu hình ESLint.
- CMS API còn nhiều đầu vào `any` chưa được validate.
- Chưa có CI, tài liệu deploy, backup hoặc restore.
- Tài liệu thiết kế hiện tại có một số mô tả lệch schema/code thật.

---

## 3. Architecture

Giữ nguyên pnpm Turborepo và stack hiện tại. API được chia theo các ranh giới nghiệp vụ:

| Module | Responsibility |
|---|---|
| `Auth` | Đăng nhập admin, phiên quản trị, bảo vệ API admin |
| `Catalog` | Danh mục, sản phẩm, trạng thái bán, ảnh sản phẩm |
| `Orders` | Tạo đơn, tồn kho, trạng thái giao hàng, tra cứu đơn |
| `Payments` | Trạng thái thanh toán, cấu hình và hướng dẫn chuyển khoản |
| `Homepage` | Banner, nhóm sản phẩm, danh mục nổi bật và bố cục trang chủ |
| `Content` | Tin tức, chính sách và rich-text content |

`packages/shared` chứa contract/type dùng chung cho catalog, orders, payments và content. API vẫn dùng DTO/class-validator tại biên HTTP; shared contracts tránh định nghĩa frontend bị lệch.

### 3.1 Data model changes

- Chuyển `Product.status`, `Order.status`, `Order.paymentMethod` sang Prisma enum.
- Thêm `PaymentStatus` vào `Order`.
- Thêm `publicCode` ngẫu nhiên, duy nhất và dễ nhập vào `Order`.
- Thêm `checkoutAttemptId` duy nhất vào `Order` để chống tạo đơn lặp.
- Thêm snapshot tên sản phẩm vào `OrderItem`.
- Thêm thời điểm cập nhật và các mốc trạng thái cần thiết vào `Order`.
- Mở rộng `StoreSettings` với thông tin ngân hàng, QR và hướng dẫn chuyển khoản.
- Thêm `ContentPost` với enum type/status, rich-text JSON và `sortOrder`.

### 3.2 VPS topology

```text
shop.example.vn       -> storefront :3000
shop.example.vn/api   -> API :3001
shop.example.vn/uploads -> API :3001/uploads

admin.example.vn      -> admin :3002
admin.example.vn/api  -> API :3001
admin.example.vn/uploads -> API :3001/uploads
```

Frontend gọi API bằng đường dẫn cùng origin `/api`. Reverse proxy chuyển request tới NestJS. Cấu hình này giúp cookie admin hoạt động ổn định, giảm phụ thuộc CORS và giữ API nội bộ linh hoạt.

PostgreSQL và thư mục uploads nằm trên VPS. Cả database và uploads phải có backup định kỳ và quy trình restore được kiểm tra.

---

## 4. Catalog and Inventory

### 4.1 Product visibility

Sản phẩm có trạng thái rõ ràng:

```text
ACTIVE
INACTIVE
```

API storefront chỉ trả sản phẩm `ACTIVE`. Admin có thể xem và quản lý cả hai trạng thái. Sản phẩm hết hàng vẫn có thể hiển thị nhưng không thể thêm vào giỏ hoặc đặt mua.

### 4.2 Product validation

- Giá bán phải lớn hơn `0`.
- Giá gốc nếu có phải không nhỏ hơn giá bán.
- Tồn kho phải là số nguyên không âm.
- Slug là duy nhất và được chuẩn hóa.
- Danh mục phải tồn tại.
- Cập nhật sản phẩm phải dùng cùng quy tắc validation như tạo mới.
- MVP dùng danh mục phẳng. Trường `parentId` chưa được sử dụng phải được bỏ khỏi API/form hoặc hoàn thiện quan hệ trước khi đưa vào sử dụng.

### 4.3 Inventory rules

- Tạo đơn phải gộp các dòng sản phẩm trùng ID trước khi xử lý.
- Giới hạn số dòng hàng và số lượng mỗi dòng để tránh payload bất thường.
- Tồn kho được giảm bằng cập nhật có điều kiện trong transaction, chỉ thành công khi tồn kho hiện tại đủ.
- Nếu bất kỳ dòng hàng nào không hợp lệ hoặc thiếu tồn kho, toàn bộ transaction thất bại.
- Chuyển đơn sang `CANCELLED` hoàn kho đúng một lần.
- Không hoàn kho lần nữa khi cập nhật lại một đơn đã hủy.

---

## 5. Orders and Payments

### 5.1 Order model

Đơn hàng lưu snapshot cần thiết để lịch sử không phụ thuộc dữ liệu sản phẩm thay đổi:

- Thông tin người nhận.
- Phương thức thanh toán.
- Tổng tiền do server tính.
- Tên sản phẩm, giá và số lượng tại thời điểm mua.
- Trạng thái giao hàng.
- Trạng thái thanh toán.
- Mã tra cứu dễ nhập, không lộ ID nội bộ.
- Thời điểm tạo/cập nhật.

### 5.2 Status models

```text
OrderStatus:
PENDING -> CONFIRMED -> SHIPPING -> COMPLETED
PENDING -> CANCELLED
CONFIRMED -> CANCELLED

PaymentStatus:
UNPAID -> PAID -> REFUNDED
```

Quy tắc:

- Không cho chuyển trạng thái tùy ý ngoài các đường hợp lệ.
- Đơn `SHIPPING` hoặc `COMPLETED` không thể hủy bằng thao tác thông thường.
- COD bắt đầu ở `UNPAID`; admin đánh dấu `PAID` khi thu tiền.
- Chuyển khoản bắt đầu ở `UNPAID`; admin xác nhận thủ công khi nhận tiền.
- `REFUNDED` chỉ áp dụng cho đơn đã từng `PAID`.
- Hủy đơn đã thanh toán không tự động đổi sang `REFUNDED`; admin phải xác nhận hoàn tiền bằng thao tác riêng.
- Thay đổi trạng thái quan trọng phải lưu dấu thời gian và admin thực hiện để hỗ trợ truy vết.

### 5.3 Checkout

- Khách không cần tài khoản.
- API chỉ nhận product ID và quantity; giá và tổng tiền luôn lấy từ database.
- Chỉ chấp nhận `COD` hoặc `BANK_TRANSFER`.
- Validate tên, số điện thoại Việt Nam, địa chỉ, ghi chú và danh sách sản phẩm.
- Client tạo `checkoutAttemptId` dạng UUID cho mỗi lần checkout. API lưu giá trị duy nhất này; request lặp trả lại đơn đã tạo thay vì tạo đơn mới.
- Sau khi tạo đơn, API trả mã tra cứu và thông tin cần cho trang thành công.

### 5.4 Bank transfer

`StoreSettings` bổ sung cấu hình:

- Tên ngân hàng.
- Số tài khoản.
- Tên chủ tài khoản.
- URL ảnh QR.
- Mẫu nội dung chuyển khoản.
- Hướng dẫn chuyển khoản.

Admin upload ảnh QR tĩnh; MVP không tích hợp VietQR hoặc đối soát ngân hàng tự động. Trang thành công hiển thị thông tin/QR khi đơn dùng `BANK_TRANSFER`. Nội dung chuyển khoản phải chứa mã tra cứu đơn. Với COD, trang thành công chỉ hiển thị xác nhận và mã tra cứu.

### 5.5 Order tracking

Route storefront `/orders/tracking` cho phép nhập:

- Mã tra cứu đơn.
- Số điện thoại đã đặt hàng.

Kết quả chỉ trả dữ liệu phù hợp cho khách:

- Mã đơn, ngày đặt.
- Trạng thái giao hàng và thanh toán.
- Danh sách sản phẩm snapshot.
- Tổng tiền.
- Hướng dẫn chuyển khoản nếu vẫn chưa thanh toán.

Không trả ghi chú nội bộ, ID nội bộ hoặc dữ liệu của đơn khác. Endpoint phải có rate limit và phản hồi chung khi thông tin không khớp.

### 5.6 Admin order management

- Danh sách đơn hỗ trợ tìm kiếm, lọc, phân trang và xem chi tiết.
- Admin cập nhật trạng thái giao hàng và thanh toán bằng các hành động hợp lệ.
- Giao diện cảnh báo trước thao tác hủy/hoàn kho/refund.
- Dashboard lấy số liệu tổng hợp từ API riêng:
  - Doanh thu từ đơn `PAID`.
  - Đơn chờ xác nhận.
  - Chuyển khoản chờ xác nhận.
  - Đơn đang giao.
  - Sản phẩm sắp hết và hết hàng.

---

## 6. Content CMS

### 6.1 Content model

Một model dùng chung cho tin tức và chính sách:

```text
ContentType: NEWS | POLICY
ContentStatus: DRAFT | PUBLISHED
```

Mỗi bài gồm:

- Tiêu đề.
- Slug duy nhất theo loại nội dung, enforced bằng composite unique `(type, slug)`.
- Mô tả ngắn.
- Ảnh đại diện tùy chọn.
- Rich-text content dạng JSON có cấu trúc.
- Trạng thái.
- Ngày xuất bản dùng để hiển thị và sắp xếp.
- Thứ tự hiển thị, dùng chủ yếu cho chính sách.
- Thời điểm tạo/cập nhật.

Ngày xuất bản không tự động thay đổi trạng thái. Admin phải chủ động xuất bản hoặc gỡ xuất bản.

### 6.2 Rich-text editor

- Admin dùng Tiptap với document JSON làm định dạng lưu trữ.
- Chỉ hỗ trợ bộ định dạng MVP: heading, paragraph, bold, italic, bullet/numbered list, link, quote và image.
- Lưu Tiptap document JSON có schema/version rõ ràng.
- API validate cấu trúc trước khi lưu.
- Storefront render bằng renderer an toàn; không render HTML tùy ý từ người dùng.
- Link được validate protocol; ảnh dùng upload service hiện có.

### 6.3 Admin content flow

- Danh sách theo loại nội dung, trạng thái, từ khóa.
- Tạo, sửa, xem trước, xuất bản và gỡ xuất bản.
- Slug được sinh từ tiêu đề nhưng admin có thể sửa.
- Không xóa âm thầm bài đã xuất bản; giao diện phải xác nhận thao tác.

### 6.4 Storefront content routes

- `/news`: danh sách tin đã xuất bản.
- `/news/[slug]`: chi tiết tin.
- `/policy`: danh sách chính sách đã xuất bản.
- `/policy/[slug]`: chi tiết chính sách.

Storefront chỉ nhận nội dung `PUBLISHED`. Tin tức sắp xếp theo ngày xuất bản giảm dần; chính sách sắp xếp theo `sortOrder` tăng dần.

---

## 7. Storefront Completion

### 7.1 Required routes

- `/categories`: danh sách tất cả danh mục hoạt động.
- `/categories/[slug]`: sản phẩm theo danh mục.
- `/products/[id]`: chi tiết sản phẩm.
- `/cart`.
- `/checkout`.
- `/checkout/success`.
- `/orders/tracking`.
- `/deals`.
- `/news` và `/news/[slug]`.
- `/policy` và `/policy/[slug]`.
- `/contact`.

### 7.2 Navigation rules

- Header/footer/mobile navigation chỉ hiển thị route hoạt động.
- Ẩn tài khoản, thông báo và yêu thích.
- Mọi link chính sách/tin tức lấy từ content đã xuất bản hoặc route danh sách.
- Hotline, địa chỉ, social links, QR và thông tin chuyển khoản lấy từ `StoreSettings`.
- Newsletter chỉ hiển thị khi có endpoint đăng ký hoạt động; nếu chưa có thì ẩn.

### 7.3 Product presentation

- Không hiển thị rating hoặc số đã bán giả lập.
- Nút mua bị vô hiệu hóa khi hết hàng hoặc sản phẩm không hoạt động.
- Cart không đảm bảo giá/tồn kho cuối cùng; checkout API xác nhận lại và trả lỗi rõ ràng nếu dữ liệu thay đổi.
- Ảnh sản phẩm và ảnh CMS nội bộ đều được resolve qua cùng một helper URL.
- Các trạng thái loading, empty, not-found và API error có thông báo tiếng Việt nhất quán.

---

## 8. Admin Completion

- Tất cả request admin dùng helper có `credentials: 'include'` hoặc gọi `/api` cùng origin.
- Middleware chỉ là lớp UX redirect; API guard vẫn là nguồn kiểm soát truy cập chính.
- Khi API trả `401`, admin chuyển về login và giữ callback URL.
- Các form dùng type/contract rõ ràng thay cho `any`.
- CMS homepage giữ phạm vi hiện tại nhưng bổ sung validation đầy đủ.
- Cấu hình cửa hàng mở rộng cho social links, support/policy navigation, QR và thông tin ngân hàng.
- Các trang danh mục, sản phẩm, đơn hàng, content và settings có phản hồi lỗi/thành công nhất quán.

---

## 9. Security and Validation

### 9.1 Dependencies and secrets

- Nâng Next.js và dependency production tới phiên bản vá tương thích, không còn critical/high đã có bản vá.
- Bỏ `.env` khỏi Git index, thêm `.env.example` không chứa secret.
- Thay `DATABASE_URL` và mọi credential từng bị commit.
- Seed admin không dùng mật khẩu mặc định yếu trong production.

### 9.2 Authentication

- Rate limit login.
- Xóa hoặc dọn session hết hạn định kỳ.
- Cookie admin dùng `httpOnly`, `secure` trong production và `sameSite: 'lax'`.
- Logout xóa session server-side.
- Không dựa riêng vào sự tồn tại của cookie để xem admin đã xác thực.

### 9.3 API boundary

- DTO cho toàn bộ body/query/params quan trọng.
- Validation pipe dùng whitelist và cấm field không mong đợi cho API ghi dữ liệu.
- Enum cho trạng thái đơn, thanh toán, phương thức thanh toán và trạng thái sản phẩm.
- Chuẩn hóa lỗi Prisma: không tìm thấy thành `404`, vi phạm unique thành `409`, vi phạm quan hệ/ràng buộc thành `400`.
- Rate limit endpoint đặt hàng và tra cứu đơn.
- Giới hạn pagination tối đa.

### 9.4 Uploads

- Multer chặn kích thước file trước khi giữ toàn bộ trong RAM.
- Giới hạn số lượng file.
- Chỉ cho MIME/type ảnh cho phép và kiểm tra file signature.
- Tên file ngẫu nhiên, namespace whitelist và đường dẫn không thể traversal.
- Upload CMS/product phải dọn file nếu ghi database thất bại.
- Backup uploads cùng database.

---

## 10. Error Handling and Observability

- API dùng format lỗi nhất quán gồm status, code, message và field errors khi có.
- Thông báo customer-facing và admin-facing bằng tiếng Việt.
- Không log password, session token, thông tin chuyển khoản nhạy cảm hoặc payload khách đầy đủ.
- Health endpoint kiểm tra ứng dụng và kết nối database.
- Log có request ID, route, status và thời gian xử lý.
- Storefront fallback khi homepage CMS lỗi vẫn hiển thị catalog hoạt động.
- Admin hiển thị lỗi tải/lưu rõ ràng thay vì chỉ ghi console.

---

## 11. Testing and Quality Gates

### 11.1 API tests

- Tạo đơn thành công và server tự tính giá.
- Không bán vượt tồn với hai request đồng thời.
- Gộp dòng sản phẩm trùng và reject quantity bất hợp lệ.
- Hủy đơn hoàn kho đúng một lần.
- Chuyển trạng thái đơn/thanh toán đúng và reject chuyển sai.
- Tra cứu đơn yêu cầu đúng mã + số điện thoại.
- API storefront không trả sản phẩm inactive hoặc content draft.
- API admin bị chặn khi thiếu/không hợp lệ session.
- CMS rich-text và settings reject payload không hợp lệ.
- Upload reject file quá lớn, sai type và namespace sai.

### 11.2 Frontend tests

- Cart add/update/remove và persisted state.
- Checkout hiển thị lỗi tồn kho/giá thay đổi.
- Success page hiển thị đúng COD hoặc chuyển khoản.
- Tracking form và trạng thái kết quả.
- Content renderer chỉ render node được hỗ trợ.
- Navigation không chứa link chết hoặc tính năng ngoài MVP.

### 11.3 End-to-end tests

1. Khách tìm sản phẩm, thêm giỏ, đặt COD, nhận mã và tra cứu đơn.
2. Khách đặt chuyển khoản, thấy QR/hướng dẫn, admin xác nhận thanh toán.
3. Admin đăng nhập, quản lý sản phẩm, xử lý đơn và xuất bản một bài chính sách.

### 11.4 CI gates

CI chạy không tương tác:

```bash
pnpm lint
pnpm --filter @repo/shared test
pnpm --filter api test
pnpm build
pnpm audit --prod --audit-level=high
```

Lint, test và build phải xanh. Audit không còn critical/high có bản vá tương thích.

---

## 12. Deployment and Recovery

- Reverse proxy cấu hình TLS và same-origin `/api` + `/uploads`.
- Deploy chạy install, build, Prisma migration và restart theo thứ tự có kiểm soát.
- PostgreSQL không mở công khai ra internet.
- Upload directory có quyền ghi chỉ cho API service.
- Backup database và uploads theo lịch, giữ nhiều phiên bản.
- Có tài liệu restore và kiểm tra restore định kỳ.
- Có `.env.example`, runbook deploy, migration, seed admin, backup và rollback.

---

## 13. Delivery Phases

Thiết kế này được triển khai bằng bốn kế hoạch độc lập, theo thứ tự:

### Phase 1: Foundation and Security

- Dependency/security patches.
- Secret hygiene.
- Same-origin API/admin session fix.
- DTO/validation/upload hardening.
- Lint và CI nền tảng.

### Phase 2: Orders, Payments and Inventory

- Atomic inventory.
- Order/payment status models.
- Checkout idempotency.
- Bank transfer instructions.
- Order tracking và admin order workflow.

### Phase 3: Content CMS and Storefront Completion

- Rich-text content model/editor/renderer.
- News, policy, contact và categories routes.
- Navigation cleanup.
- Store settings integration và image URL consistency.

### Phase 4: Operations and End-to-End Quality

- Dashboard aggregates.
- Frontend/component/E2E tests.
- Reverse proxy/deploy docs.
- Backup/restore and observability.

Mỗi phase phải tạo ra phần mềm chạy được và có test riêng. Không bắt đầu phase sau nếu các lỗi nghiêm trọng của phase trước chưa được giải quyết.

---

## 14. Acceptance Criteria

MVP hoàn thành khi:

- Khách hoàn thành được COD và chuyển khoản không cần tài khoản.
- Tồn kho không âm khi có request đồng thời và được hoàn đúng một lần khi hủy.
- Khách tra cứu được đơn bằng mã + số điện thoại.
- Admin quản lý được trạng thái giao hàng và thanh toán tách biệt.
- Admin tạo/xuất bản được tin tức và chính sách rich-text; storefront chỉ hiển thị bài đã xuất bản.
- Không còn link chết trong các luồng và điều hướng MVP.
- Không còn dữ liệu rating/đã bán giả lập được trình bày như dữ liệu thật.
- Tất cả API ghi dữ liệu quan trọng có DTO validation.
- `.env` không còn được Git theo dõi và credential đã lộ được thay.
- Tất cả CI gates xanh.
- Không còn dependency production critical/high đã có bản vá tương thích.
- VPS có deploy, backup và restore runbook được kiểm tra.
