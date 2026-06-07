-- 1. Create new enums
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'BANK_TRANSFER');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');
CREATE TYPE "OrderEventType" AS ENUM ('ORDER_STATUS_CHANGED', 'PAYMENT_STATUS_CHANGED', 'STOCK_RESTORED');

-- 2. Add new columns to Order (all nullable initially for safe migration)
ALTER TABLE "Order" ADD COLUMN "publicCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "checkoutAttemptId" TEXT;
ALTER TABLE "Order" ADD COLUMN "checkoutAttemptExpiresAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "phoneNormalized" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';
ALTER TABLE "Order" ADD COLUMN "stockRestoredAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- 3. Convert status from String to OrderStatus (expand/copy/contract)
ALTER TABLE "Order" ADD COLUMN "status_new" "OrderStatus";

-- Map existing string statuses to new enum
UPDATE "Order" SET "status_new" = CASE
  WHEN "status" = 'PENDING' THEN 'PENDING'::"OrderStatus"
  WHEN "status" = 'SHIPPING' THEN 'SHIPPING'::"OrderStatus"
  WHEN "status" = 'SUCCESS' THEN 'COMPLETED'::"OrderStatus"
  WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"OrderStatus"
  WHEN "status" = 'DELIVERED' THEN 'COMPLETED'::"OrderStatus"
  ELSE 'PENDING'::"OrderStatus"
END;

ALTER TABLE "Order" ALTER COLUMN "status_new" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "status_new" SET DEFAULT 'PENDING';
ALTER TABLE "Order" DROP COLUMN "status";
ALTER TABLE "Order" RENAME COLUMN "status_new" TO "status";

-- 4. Convert paymentMethod from String to PaymentMethod (expand/copy/contract)
ALTER TABLE "Order" ADD COLUMN "paymentMethod_new" "PaymentMethod";

UPDATE "Order" SET "paymentMethod_new" = CASE
  WHEN "paymentMethod" = 'COD' THEN 'COD'::"PaymentMethod"
  WHEN "paymentMethod" = 'BANK_TRANSFER' THEN 'BANK_TRANSFER'::"PaymentMethod"
  WHEN "paymentMethod" = 'bank_transfer' THEN 'BANK_TRANSFER'::"PaymentMethod"
  ELSE 'COD'::"PaymentMethod"
END;

ALTER TABLE "Order" ALTER COLUMN "paymentMethod_new" SET NOT NULL;
ALTER TABLE "Order" DROP COLUMN "paymentMethod";
ALTER TABLE "Order" RENAME COLUMN "paymentMethod_new" TO "paymentMethod";

-- 5. Backfill publicCode for existing orders
UPDATE "Order" SET
  "publicCode" = 'LEGACY' || upper(substr(md5("id"), 1, 10)),
  "checkoutAttemptId" = 'legacy-' || "id",
  "checkoutAttemptExpiresAt" = NOW() - INTERVAL '1 day',
  "phoneNormalized" = regexp_replace("phone", '[^0-9]', '', 'g');

-- Fix phone normalization: strip leading 84 → 0
UPDATE "Order" SET "phoneNormalized" = '0' || substr("phoneNormalized", 3)
WHERE "phoneNormalized" LIKE '84%';

-- 6. Add productName to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "productName" TEXT;

UPDATE "OrderItem" oi SET "productName" = COALESCE(p."name", 'Sản phẩm')
FROM "Product" p WHERE oi."productId" = p."id";

ALTER TABLE "OrderItem" ALTER COLUMN "productName" SET NOT NULL;

-- 7. Create OrderEvent table
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderEventType" NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId", "createdAt");

ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. Add bank fields to StoreSettings
ALTER TABLE "StoreSettings" ADD COLUMN "bankName" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "bankAccountNumber" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "bankAccountHolder" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "bankQrImageUrl" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "bankTransferTemplate" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "bankTransferInstructions" TEXT;

-- 9. Add constraints (unique, not null) after backfill
ALTER TABLE "Order" ALTER COLUMN "publicCode" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "phoneNormalized" SET NOT NULL;

CREATE UNIQUE INDEX "Order_publicCode_key" ON "Order"("publicCode");
CREATE UNIQUE INDEX "Order_checkoutAttemptId_key" ON "Order"("checkoutAttemptId");
CREATE INDEX "Order_phoneNormalized_idx" ON "Order"("phoneNormalized");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_publicCode_phoneNormalized_idx" ON "Order"("publicCode", "phoneNormalized");

-- Drop old OrderItem indexes if they exist (Prisma will manage them)
