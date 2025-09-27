/*
  Warnings:

  - The values [BOOKS_EDUCATION,HEALTH_BEAUTY,BABY_KIDS,AGRICULTURE,ART_CRAFTS,FURNITURE,APPLIANCES,BOOKS,SPORTS,TOYS,BEAUTY] on the enum `ListingCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ListingCategory_new" AS ENUM ('ELECTRONICS', 'FASHION', 'VEHICLES', 'HOME_GARDEN', 'BOOKS_MEDIA', 'SPORTS_RECREATION', 'AUTOMOTIVE', 'BEAUTY_HEALTH', 'TOYS_GAMES', 'JEWELRY_ACCESSORIES', 'ARTS_CRAFTS', 'MUSICAL_INSTRUMENTS', 'FOOD_BEVERAGES', 'TOOLS_EQUIPMENT', 'SERVICES', 'HOME_APPLIANCES', 'PET_SUPPLIES', 'OFFICE_SUPPLIES', 'OTHER');
ALTER TABLE "public"."ModerationRule" ALTER COLUMN "appliesToCategories" DROP DEFAULT;
ALTER TABLE "public"."Listing" ALTER COLUMN "category" TYPE "public"."ListingCategory_new" USING ("category"::text::"public"."ListingCategory_new");
ALTER TABLE "public"."ModerationRule" ALTER COLUMN "appliesToCategories" TYPE "public"."ListingCategory_new"[] USING ("appliesToCategories"::text::"public"."ListingCategory_new"[]);
ALTER TYPE "public"."ListingCategory" RENAME TO "ListingCategory_old";
ALTER TYPE "public"."ListingCategory_new" RENAME TO "ListingCategory";
DROP TYPE "public"."ListingCategory_old";
ALTER TABLE "public"."ModerationRule" ALTER COLUMN "appliesToCategories" SET DEFAULT ARRAY[]::"public"."ListingCategory"[];
COMMIT;

-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "isCashOnly" BOOLEAN NOT NULL DEFAULT false;
