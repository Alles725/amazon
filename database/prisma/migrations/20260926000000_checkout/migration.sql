-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount_minor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "shipping_address" JSONB,
ADD COLUMN     "shipping_minor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "source_cart_id" UUID,
ADD COLUMN     "subtotal_minor" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_source_cart_id_key" ON "orders"("source_cart_id");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve the meaning of legacy order totals (no historical shipping/discounts).
UPDATE "orders" SET "subtotal_minor" = "total_minor";
