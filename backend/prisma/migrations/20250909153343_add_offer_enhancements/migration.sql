/*
  Warnings:

  - The values [NEW_OFFER] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELLED,COMPLETED] on the enum `OfferStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CASH_ONLY,SWAP_ONLY,CASH_PLUS_SWAP] on the enum `OfferType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `swapItemId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the `SwapItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationType_new" AS ENUM ('OFFER_RECEIVED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'COUNTEROFFER_RECEIVED', 'OFFER_EXPIRED', 'OFFER_WITHDRAWN', 'MESSAGE_RECEIVED', 'PAYMENT_RECEIVED', 'REVIEW_RECEIVED', 'LISTING_APPROVED', 'LISTING_REJECTED', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'SYSTEM_ANNOUNCEMENT');
ALTER TABLE "public"."Notification" ALTER COLUMN "type" TYPE "public"."NotificationType_new" USING ("type"::text::"public"."NotificationType_new");
ALTER TYPE "public"."NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OfferStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'WITHDRAWN', 'EXPIRED');
ALTER TABLE "public"."Offer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Offer" ALTER COLUMN "status" TYPE "public"."OfferStatus_new" USING ("status"::text::"public"."OfferStatus_new");
ALTER TYPE "public"."OfferStatus" RENAME TO "OfferStatus_old";
ALTER TYPE "public"."OfferStatus_new" RENAME TO "OfferStatus";
DROP TYPE "public"."OfferStatus_old";
ALTER TABLE "public"."Offer" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OfferType_new" AS ENUM ('CASH', 'SWAP', 'HYBRID');
ALTER TABLE "public"."Offer" ALTER COLUMN "offerType" TYPE "public"."OfferType_new" USING ("offerType"::text::"public"."OfferType_new");
ALTER TYPE "public"."OfferType" RENAME TO "OfferType_old";
ALTER TYPE "public"."OfferType_new" RENAME TO "OfferType";
DROP TYPE "public"."OfferType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Media" DROP CONSTRAINT "Media_swapItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SwapItem" DROP CONSTRAINT "SwapItem_offerId_fkey";

-- DropIndex
DROP INDEX "public"."Media_swapItemId_idx";

-- AlterTable
ALTER TABLE "public"."Media" DROP COLUMN "swapItemId";

-- AlterTable
ALTER TABLE "public"."Offer" ADD COLUMN     "parentOfferId" UUID;

-- DropTable
DROP TABLE "public"."SwapItem";

-- CreateTable
CREATE TABLE "public"."OfferListing" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerId" UUID NOT NULL,
    "listingId" UUID NOT NULL,

    CONSTRAINT "OfferListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferListing_offerId_idx" ON "public"."OfferListing"("offerId");

-- CreateIndex
CREATE INDEX "OfferListing_listingId_idx" ON "public"."OfferListing"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferListing_offerId_listingId_key" ON "public"."OfferListing"("offerId", "listingId");

-- CreateIndex
CREATE INDEX "Offer_parentOfferId_idx" ON "public"."Offer"("parentOfferId");

-- AddForeignKey
ALTER TABLE "public"."Offer" ADD CONSTRAINT "Offer_parentOfferId_fkey" FOREIGN KEY ("parentOfferId") REFERENCES "public"."Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfferListing" ADD CONSTRAINT "OfferListing_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfferListing" ADD CONSTRAINT "OfferListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
