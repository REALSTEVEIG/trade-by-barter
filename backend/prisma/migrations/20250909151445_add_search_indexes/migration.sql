-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ListingCategory" ADD VALUE 'FURNITURE';
ALTER TYPE "public"."ListingCategory" ADD VALUE 'APPLIANCES';
ALTER TYPE "public"."ListingCategory" ADD VALUE 'BOOKS';
ALTER TYPE "public"."ListingCategory" ADD VALUE 'SPORTS';
ALTER TYPE "public"."ListingCategory" ADD VALUE 'TOYS';
ALTER TYPE "public"."ListingCategory" ADD VALUE 'BEAUTY';
