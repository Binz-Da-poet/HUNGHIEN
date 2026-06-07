-- Create enum type if not exists
DO $$ BEGIN
    CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
-- Add new enum column
ALTER TABLE "Product" ADD COLUMN "status_new" "ProductStatus";
-- Copy data with safe cast
UPDATE "Product" SET "status_new" = CASE
  WHEN "status" = 'INACTIVE' THEN 'INACTIVE'::"ProductStatus"
  ELSE 'ACTIVE'::"ProductStatus"
END;
-- Set NOT NULL with default
ALTER TABLE "Product" ALTER COLUMN "status_new" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "status_new" SET DEFAULT 'ACTIVE';
-- Drop old column
ALTER TABLE "Product" DROP COLUMN "status";
-- Rename new column
ALTER TABLE "Product" RENAME COLUMN "status_new" TO "status";
