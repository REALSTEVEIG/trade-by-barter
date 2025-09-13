import { MediaEntityType, MediaCategory, QualityLevel, CompressionLevel } from './upload.dto';
export declare enum MediaStatus {
    UPLOADING = "UPLOADING",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED",
    EXPIRED = "EXPIRED",
    DELETED = "DELETED"
}
export declare enum StorageProvider {
    LOCAL = "LOCAL",
    S3 = "S3",
    CLOUDINARY = "CLOUDINARY",
    AZURE = "AZURE",
    GCS = "GCS"
}
export declare enum ModerationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    FLAGGED = "FLAGGED",
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
}
export declare class MediaVariantDto {
    id: string;
    quality: QualityLevel;
    url: string;
    size: number;
    width?: number;
    height?: number;
    format: string;
    storageKey: string;
    createdAt: Date;
}
export declare class MediaMetadataDto {
    width?: number;
    height?: number;
    duration?: number;
    format: string;
    size: number;
    bitrate?: string;
    framerate?: number;
    colorSpace?: string;
    additional?: Record<string, any>;
}
export declare class MediaResponseDto {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    category: MediaCategory;
    entityType: MediaEntityType;
    entityId?: string;
    status: MediaStatus;
    processingJobId?: string;
    processingError?: string;
    metadata?: MediaMetadataDto;
    storageProvider: StorageProvider;
    storageKey: string;
    storageRegion?: string;
    variants: MediaVariantDto[];
    checksum?: string;
    isSecure: boolean;
    moderationStatus: ModerationStatus;
    moderationFlags: string[];
    accessCount: number;
    lastAccessedAt?: Date;
    expiresAt?: Date;
    isOrphan: boolean;
    uploadRegion?: string;
    compressionLevel: CompressionLevel;
    bandwidthOptimized: boolean;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}
export declare class MediaListResponseDto {
    items: MediaResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class MediaUploadResponseDto {
    message: string;
    media: MediaResponseDto[];
    failed: Array<{
        filename: string;
        error: string;
    }>;
    uploadedCount: number;
    failedCount: number;
    processingJobs: string[];
}
