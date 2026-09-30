-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- Checkout and the product page used the oldest saved address as the implicit
-- default. Keep that behaviour for existing accounts by marking it explicitly.
UPDATE "addresses" SET "is_default" = true
WHERE "id" IN (
    SELECT DISTINCT ON ("user_id") "id" FROM "addresses" ORDER BY "user_id", "created_at", "id"
);
