/*
  Warnings:

  - The values [FURNITURE,APPLIANCES,BOOKS,SPORTS,TOYS,BEAUTY] on the enum `ListingCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'PAUSED', 'EXPIRED', 'REMOVED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ListingCategory_new" AS ENUM ('ELECTRONICS', 'FASHION', 'VEHICLES', 'HOME_GARDEN', 'BOOKS_EDUCATION', 'HEALTH_BEAUTY', 'SPORTS_RECREATION', 'BABY_KIDS', 'AGRICULTURE', 'SERVICES', 'ART_CRAFTS', 'MUSICAL_INSTRUMENTS', 'OTHER');
ALTER TABLE "public"."Listing" ALTER COLUMN "category" TYPE "public"."ListingCategory_new" USING ("category"::text::"public"."ListingCategory_new");
ALTER TABLE "public"."SwapItem" ALTER COLUMN "category" TYPE "public"."ListingCategory_new" USING ("category"::text::"public"."ListingCategory_new");
ALTER TYPE "public"."ListingCategory" RENAME TO "ListingCategory_old";
ALTER TYPE "public"."ListingCategory_new" RENAME TO "ListingCategory";
DROP TYPE "public"."ListingCategory_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."Listing_isActive_isFeatured_idx";

-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."ListingStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "listingId" UUID NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "public"."Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_listingId_idx" ON "public"."Favorite"("listingId");

-- CreateIndex
CREATE INDEX "Favorite_createdAt_idx" ON "public"."Favorite"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "public"."Favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "Listing_status_isActive_isFeatured_idx" ON "public"."Listing"("status", "isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "Listing_title_description_idx" ON "public"."Listing"("title", "description");

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
