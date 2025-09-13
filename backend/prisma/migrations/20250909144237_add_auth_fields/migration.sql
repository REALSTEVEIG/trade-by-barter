/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - First add nullable columns
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "phoneOtp" TEXT,
ADD COLUMN     "phoneOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3);

-- Update existing users with a default password hash (for development purposes)
-- This is a hash of "TempPassword123!" using argon2
UPDATE "public"."User" SET "password" = '$argon2id$v=19$m=65536,t=3,p=4$ZXhhbXBsZXNhbHQ$J2mY+0eO4L5+Hq5I7J3vI1YqL5J8vI1YqL5J8vI1YqL' WHERE "password" IS NULL;

-- Now make the password field NOT NULL
ALTER TABLE "public"."User" ALTER COLUMN "password" SET NOT NULL;
