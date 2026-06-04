WITH ranked_primary_images AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "productId"
      ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC
    ) AS "rank"
  FROM "ProductImage"
  WHERE "isPrimary" = true
)
UPDATE "ProductImage"
SET "isPrimary" = false
WHERE "id" IN (
  SELECT "id"
  FROM ranked_primary_images
  WHERE "rank" > 1
);

CREATE UNIQUE INDEX "ProductImage_one_primary_per_product_idx"
ON "ProductImage"("productId")
WHERE "isPrimary" = true;
