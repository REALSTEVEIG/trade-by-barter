export declare enum MediaEntityType {
    USER = "USER",
    LISTING = "LISTING",
    CHAT = "CHAT",
    MESSAGE = "MESSAGE",
    OFFER = "OFFER",
    VERIFICATION = "VERIFICATION"
}
export declare enum MediaCategory {
    AVATAR = "AVATAR",
    LISTING_IMAGE = "LISTING_IMAGE",
    CHAT_MEDIA = "CHAT_MEDIA",
    DOCUMENT = "DOCUMENT",
    VERIFICATION = "VERIFICATION",
    GENERAL = "GENERAL"
}
export declare enum QualityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    ORIGINAL = "ORIGINAL"
}
export declare enum CompressionLevel {
    NONE = "NONE",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    MAXIMUM = "MAXIMUM"
}
export declare class ResizeOptionsDto {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
export declare class UploadDto {
    entityType: MediaEntityType;
    entityId?: string;
    category: MediaCategory;
    quality?: QualityLevel;
    compressionLevel?: CompressionLevel;
    resize?: ResizeOptionsDto;
    uploadRegion?: string;
    bandwidthOptimized?: boolean;
    processImmediately?: boolean;
    generateThumbnails?: boolean;
    expiryHours?: number;
    tags?: string[];
}
export declare class MultipleUploadDto extends UploadDto {
    maxFiles?: number;
    maintainOrder?: boolean;
}
export declare class SingleUploadDto extends UploadDto {
    replaceExisting?: boolean;
}
