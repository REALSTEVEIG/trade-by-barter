import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaEntityType, MediaCategory, QualityLevel, CompressionLevel } from './upload.dto';

export enum MediaStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  CLOUDINARY = 'CLOUDINARY',
  AZURE = 'AZURE',
  GCS = 'GCS',
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export class MediaVariantDto {
  @ApiProperty({ description: 'Variant ID' })
  id: string;

  @ApiProperty({ description: 'Quality level', enum: QualityLevel })
  quality: QualityLevel;

  @ApiProperty({ description: 'Variant URL' })
  url: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiPropertyOptional({ description: 'Image/video width' })
  width?: number;

  @ApiPropertyOptional({ description: 'Image/video height' })
  height?: number;

  @ApiProperty({ description: 'File format' })
  format: string;

  @ApiProperty({ description: 'Storage key' })
  storageKey: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class MediaMetadataDto {
  @ApiPropertyOptional({ description: 'Image/video width' })
  width?: number;

  @ApiPropertyOptional({ description: 'Image/video height' })
  height?: number;

  @ApiPropertyOptional({ description: 'Video/audio duration in seconds' })
  duration?: number;

  @ApiProperty({ description: 'File format' })
  format: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiPropertyOptional({ description: 'Bitrate for video/audio' })
  bitrate?: string;

  @ApiPropertyOptional({ description: 'Frame rate for video' })
  framerate?: number;

  @ApiPropertyOptional({ description: 'Color space' })
  colorSpace?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  additional?: Record<string, any>;
}

export class MediaResponseDto {
  @ApiProperty({ description: 'Media ID' })
  id: string;

  @ApiProperty({ description: 'Generated filename' })
  filename: string;

  @ApiProperty({ description: 'Original filename from user' })
  originalName: string;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'Primary file URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Media category', enum: MediaCategory })
  category: MediaCategory;

  @ApiProperty({ description: 'Entity type', enum: MediaEntityType })
  entityType: MediaEntityType;

  @ApiPropertyOptional({ description: 'Entity ID' })
  entityId?: string;

  @ApiProperty({ description: 'Processing status', enum: MediaStatus })
  status: MediaStatus;

  @ApiPropertyOptional({ description: 'Processing job ID' })
  processingJobId?: string;

  @ApiPropertyOptional({ description: 'Processing error message' })
  processingError?: string;

  @ApiPropertyOptional({ description: 'File metadata', type: MediaMetadataDto })
  metadata?: MediaMetadataDto;

  @ApiProperty({ description: 'Storage provider', enum: StorageProvider })
  storageProvider: StorageProvider;

  @ApiProperty({ description: 'Storage key' })
  storageKey: string;

  @ApiPropertyOptional({ description: 'Storage region' })
  storageRegion?: string;

  @ApiProperty({ description: 'Quality variants', type: [MediaVariantDto] })
  variants: MediaVariantDto[];

  @ApiPropertyOptional({ description: 'File checksum' })
  checksum?: string;

  @ApiProperty({ description: 'Passed security checks' })
  isSecure: boolean;

  @ApiProperty({ description: 'Moderation status', enum: ModerationStatus })
  moderationStatus: ModerationStatus;

  @ApiProperty({ description: 'Moderation flags' })
  moderationFlags: string[];

  @ApiProperty({ description: 'Access count' })
  accessCount: number;

  @ApiPropertyOptional({ description: 'Last accessed timestamp' })
  lastAccessedAt?: Date;

  @ApiPropertyOptional({ description: 'File expiry timestamp' })
  expiresAt?: Date;

  @ApiProperty({ description: 'Is orphaned (not linked to entity)' })
  isOrphan: boolean;

  @ApiPropertyOptional({ description: 'Upload region' })
  uploadRegion?: string;

  @ApiProperty({ description: 'Compression level', enum: CompressionLevel })
  compressionLevel: CompressionLevel;

  @ApiProperty({ description: 'Bandwidth optimized' })
  bandwidthOptimized: boolean;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'User ID' })
  userId: string;
}

export class MediaListResponseDto {
  @ApiProperty({ description: 'Media items', type: [MediaResponseDto] })
  items: MediaResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}

export class MediaUploadResponseDto {
  @ApiProperty({ description: 'Upload success message' })
  message: string;

  @ApiProperty({ description: 'Uploaded media items', type: [MediaResponseDto] })
  media: MediaResponseDto[];

  @ApiProperty({ description: 'Failed uploads' })
  failed: Array<{
    filename: string;
    error: string;
  }>;

  @ApiProperty({ description: 'Total uploaded count' })
  uploadedCount: number;

  @ApiProperty({ description: 'Total failed count' })
  failedCount: number;

  @ApiProperty({ description: 'Processing jobs started' })
  processingJobs: string[];
}