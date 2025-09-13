/*
  Warnings:

  - Added the required column `storageKey` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MediaCategory" AS ENUM ('AVATAR', 'LISTING_IMAGE', 'CHAT_MEDIA', 'DOCUMENT', 'VERIFICATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."MediaEntityType" AS ENUM ('USER', 'LISTING', 'CHAT', 'MESSAGE', 'OFFER', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."MediaStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'EXPIRED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."StorageProvider" AS ENUM ('LOCAL', 'S3', 'CLOUDINARY', 'AZURE', 'GCS');

-- CreateEnum
CREATE TYPE "public"."QualityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'ORIGINAL');

-- CreateEnum
CREATE TYPE "public"."CompressionLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'MAXIMUM');

-- CreateEnum
CREATE TYPE "public"."ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."ProcessingJobType" AS ENUM ('RESIZE', 'COMPRESS', 'CONVERT', 'THUMBNAIL', 'WATERMARK', 'METADATA_EXTRACT', 'VIRUS_SCAN', 'CONTENT_MODERATION');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING');

-- CreateEnum
CREATE TYPE "public"."JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."Media" ADD COLUMN     "accessCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bandwidthOptimized" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" "public"."MediaCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "compressionLevel" "public"."CompressionLevel" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entityId" UUID,
ADD COLUMN     "entityType" "public"."MediaEntityType" NOT NULL DEFAULT 'LISTING',
ADD COLUMN     "exifData" JSONB,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isOrphan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSecure" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "moderationFlags" TEXT[],
ADD COLUMN     "moderationStatus" "public"."ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "processingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingJobId" TEXT,
ADD COLUMN     "processingStartedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."MediaStatus" NOT NULL DEFAULT 'UPLOADING',
ADD COLUMN     "storageKey" TEXT NOT NULL,
ADD COLUMN     "storageProvider" "public"."StorageProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "storageRegion" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadRegion" TEXT,
ADD COLUMN     "userId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "public"."MediaVariant" (
    "id" UUID NOT NULL,
    "quality" "public"."QualityLevel" NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaProcessingJob" (
    "id" UUID NOT NULL,
    "type" "public"."ProcessingJobType" NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."JobPriority" NOT NULL DEFAULT 'NORMAL',
    "operations" JSONB NOT NULL,
    "options" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "queueName" TEXT NOT NULL DEFAULT 'media-processing',
    "jobId" TEXT,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserStorageQuota" (
    "id" UUID NOT NULL,
    "totalQuota" BIGINT NOT NULL DEFAULT 104857600,
    "usedStorage" BIGINT NOT NULL DEFAULT 0,
    "mediaCount" INTEGER NOT NULL DEFAULT 0,
    "imageStorage" BIGINT NOT NULL DEFAULT 0,
    "videoStorage" BIGINT NOT NULL DEFAULT 0,
    "audioStorage" BIGINT NOT NULL DEFAULT 0,
    "documentStorage" BIGINT NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumExpiry" TIMESTAMP(3),
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warningsSent" INTEGER NOT NULL DEFAULT 0,
    "lastWarningSentAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStorageQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaAnalytics" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalUploads" INTEGER NOT NULL DEFAULT 0,
    "successfulUploads" INTEGER NOT NULL DEFAULT 0,
    "failedUploads" INTEGER NOT NULL DEFAULT 0,
    "totalStorageUsed" BIGINT NOT NULL DEFAULT 0,
    "storageByProvider" JSONB NOT NULL,
    "storageByRegion" JSONB NOT NULL,
    "totalProcessingJobs" INTEGER NOT NULL DEFAULT 0,
    "successfulJobs" INTEGER NOT NULL DEFAULT 0,
    "failedJobs" INTEGER NOT NULL DEFAULT 0,
    "avgProcessingTime" INTEGER NOT NULL DEFAULT 0,
    "imageUploads" INTEGER NOT NULL DEFAULT 0,
    "videoUploads" INTEGER NOT NULL DEFAULT 0,
    "audioUploads" INTEGER NOT NULL DEFAULT 0,
    "documentUploads" INTEGER NOT NULL DEFAULT 0,
    "lagosUploads" INTEGER NOT NULL DEFAULT 0,
    "abujaUploads" INTEGER NOT NULL DEFAULT 0,
    "portHarcourtUploads" INTEGER NOT NULL DEFAULT 0,
    "otherRegionUploads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaVariant_mediaId_idx" ON "public"."MediaVariant"("mediaId");

-- CreateIndex
CREATE INDEX "MediaVariant_quality_idx" ON "public"."MediaVariant"("quality");

-- CreateIndex
CREATE UNIQUE INDEX "MediaVariant_mediaId_quality_key" ON "public"."MediaVariant"("mediaId", "quality");

-- CreateIndex
CREATE INDEX "MediaProcessingJob_mediaId_idx" ON "public"."MediaProcessingJob"("mediaId");

-- CreateIndex
CREATE INDEX "MediaProcessingJob_status_idx" ON "public"."MediaProcessingJob"("status");

-- CreateIndex
CREATE INDEX "MediaProcessingJob_type_idx" ON "public"."MediaProcessingJob"("type");

-- CreateIndex
CREATE INDEX "MediaProcessingJob_priority_idx" ON "public"."MediaProcessingJob"("priority");

-- CreateIndex
CREATE INDEX "MediaProcessingJob_queueName_idx" ON "public"."MediaProcessingJob"("queueName");

-- CreateIndex
CREATE INDEX "MediaProcessingJob_createdAt_idx" ON "public"."MediaProcessingJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStorageQuota_userId_key" ON "public"."UserStorageQuota"("userId");

-- CreateIndex
CREATE INDEX "UserStorageQuota_userId_idx" ON "public"."UserStorageQuota"("userId");

-- CreateIndex
CREATE INDEX "UserStorageQuota_isPremium_idx" ON "public"."UserStorageQuota"("isPremium");

-- CreateIndex
CREATE INDEX "UserStorageQuota_usedStorage_idx" ON "public"."UserStorageQuota"("usedStorage");

-- CreateIndex
CREATE INDEX "MediaAnalytics_date_idx" ON "public"."MediaAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAnalytics_date_key" ON "public"."MediaAnalytics"("date");

-- CreateIndex
CREATE INDEX "Media_userId_idx" ON "public"."Media"("userId");

-- CreateIndex
CREATE INDEX "Media_status_idx" ON "public"."Media"("status");

-- CreateIndex
CREATE INDEX "Media_category_idx" ON "public"."Media"("category");

-- CreateIndex
CREATE INDEX "Media_entityType_entityId_idx" ON "public"."Media"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Media_storageProvider_idx" ON "public"."Media"("storageProvider");

-- CreateIndex
CREATE INDEX "Media_uploadedAt_idx" ON "public"."Media"("uploadedAt");

-- CreateIndex
CREATE INDEX "Media_expiresAt_idx" ON "public"."Media"("expiresAt");

-- CreateIndex
CREATE INDEX "Media_isOrphan_idx" ON "public"."Media"("isOrphan");

-- CreateIndex
CREATE INDEX "Media_moderationStatus_idx" ON "public"."Media"("moderationStatus");

-- CreateIndex
CREATE INDEX "Media_uploadRegion_idx" ON "public"."Media"("uploadRegion");

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaVariant" ADD CONSTRAINT "MediaVariant_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaProcessingJob" ADD CONSTRAINT "MediaProcessingJob_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserStorageQuota" ADD CONSTRAINT "UserStorageQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
