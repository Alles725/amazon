-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "payment_card" JSONB;

-- CreateTable
CREATE TABLE "payment_cards" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" CHAR(4) NOT NULL,
    "holder_name" TEXT NOT NULL,
    "exp_month" SMALLINT NOT NULL,
    "exp_year" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_cards_user_id_idx" ON "payment_cards"("user_id");

-- AddForeignKey
ALTER TABLE "payment_cards" ADD CONSTRAINT "payment_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
