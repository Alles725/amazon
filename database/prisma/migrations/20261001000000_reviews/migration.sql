-- Reviews module (REVIEWS-001): customer reviews, helpful votes and the demo
-- listing aggregates. Products and users are referenced by id only (no foreign
-- keys into catalog/users tables), like order_items.

-- CreateEnum
CREATE TYPE "review_source" AS ENUM ('CUSTOMER', 'DEMO');

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "user_id" UUID,
    "author_name" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "source" "review_source" NOT NULL DEFAULT 'CUSTOMER',
    "fixture_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    -- Not modelled by Prisma (no drift): the database itself rejects impossible rows.
    CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
    CONSTRAINT "reviews_helpful_count_check" CHECK ("helpful_count" >= 0),
    CONSTRAINT "reviews_customer_author_check" CHECK ("source" <> 'CUSTOMER' OR "user_id" IS NOT NULL)
);

-- CreateTable
CREATE TABLE "review_helpful_votes" (
    "review_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_votes_pkey" PRIMARY KEY ("review_id","user_id")
);

-- CreateTable
CREATE TABLE "review_rating_baselines" (
    "product_id" UUID NOT NULL,
    "listing_key" TEXT NOT NULL,
    "rating_count" INTEGER NOT NULL,
    "rating_sum" INTEGER NOT NULL,
    "distribution" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_rating_baselines_pkey" PRIMARY KEY ("product_id"),
    CONSTRAINT "review_rating_baselines_values_check" CHECK (
        "rating_count" > 0 AND "rating_sum" BETWEEN "rating_count" AND "rating_count" * 5
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_fixture_key_key" ON "reviews"("fixture_key");

-- CreateIndex
CREATE INDEX "reviews_product_id_helpful_count_idx" ON "reviews"("product_id", "helpful_count");

-- CreateIndex
CREATE INDEX "reviews_product_id_created_at_idx" ON "reviews"("product_id", "created_at");

-- CreateIndex
CREATE INDEX "reviews_product_id_rating_idx" ON "reviews"("product_id", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_product_id_user_id_key" ON "reviews"("product_id", "user_id");

-- CreateIndex
CREATE INDEX "review_helpful_votes_user_id_idx" ON "review_helpful_votes"("user_id");

-- CreateIndex
CREATE INDEX "review_rating_baselines_listing_key_idx" ON "review_rating_baselines"("listing_key");

-- AddForeignKey
ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
