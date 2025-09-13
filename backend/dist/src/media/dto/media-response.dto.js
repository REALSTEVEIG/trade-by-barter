"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadResponseDto = exports.MediaListResponseDto = exports.MediaResponseDto = exports.MediaMetadataDto = exports.MediaVariantDto = exports.ModerationStatus = exports.StorageProvider = exports.MediaStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const upload_dto_1 = require("./upload.dto");
var MediaStatus;
(function (MediaStatus) {
    MediaStatus["UPLOADING"] = "UPLOADING";
    MediaStatus["PROCESSING"] = "PROCESSING";
    MediaStatus["READY"] = "READY";
    MediaStatus["FAILED"] = "FAILED";
    MediaStatus["EXPIRED"] = "EXPIRED";
    MediaStatus["DELETED"] = "DELETED";
})(MediaStatus || (exports.MediaStatus = MediaStatus = {}));
var StorageProvider;
(function (StorageProvider) {
    StorageProvider["LOCAL"] = "LOCAL";
    StorageProvider["S3"] = "S3";
    StorageProvider["CLOUDINARY"] = "CLOUDINARY";
    StorageProvider["AZURE"] = "AZURE";
    StorageProvider["GCS"] = "GCS";
})(StorageProvider || (exports.StorageProvider = StorageProvider = {}));
var ModerationStatus;
(function (ModerationStatus) {
    ModerationStatus["PENDING"] = "PENDING";
    ModerationStatus["APPROVED"] = "APPROVED";
    ModerationStatus["REJECTED"] = "REJECTED";
    ModerationStatus["FLAGGED"] = "FLAGGED";
    ModerationStatus["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
})(ModerationStatus || (exports.ModerationStatus = ModerationStatus = {}));
class MediaVariantDto {
    id;
    quality;
    url;
    size;
    width;
    height;
    format;
    storageKey;
    createdAt;
}
exports.MediaVariantDto = MediaVariantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Variant ID' }),
    __metadata("design:type", String)
], MediaVariantDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quality level', enum: upload_dto_1.QualityLevel }),
    __metadata("design:type", String)
], MediaVariantDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Variant URL' }),
    __metadata("design:type", String)
], MediaVariantDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    __metadata("design:type", Number)
], MediaVariantDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image/video width' }),
    __metadata("design:type", Number)
], MediaVariantDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image/video height' }),
    __metadata("design:type", Number)
], MediaVariantDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File format' }),
    __metadata("design:type", String)
], MediaVariantDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage key' }),
    __metadata("design:type", String)
], MediaVariantDto.prototype, "storageKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], MediaVariantDto.prototype, "createdAt", void 0);
class MediaMetadataDto {
    width;
    height;
    duration;
    format;
    size;
    bitrate;
    framerate;
    colorSpace;
    additional;
}
exports.MediaMetadataDto = MediaMetadataDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image/video width' }),
    __metadata("design:type", Number)
], MediaMetadataDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image/video height' }),
    __metadata("design:type", Number)
], MediaMetadataDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Video/audio duration in seconds' }),
    __metadata("design:type", Number)
], MediaMetadataDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File format' }),
    __metadata("design:type", String)
], MediaMetadataDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    __metadata("design:type", Number)
], MediaMetadataDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bitrate for video/audio' }),
    __metadata("design:type", String)
], MediaMetadataDto.prototype, "bitrate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Frame rate for video' }),
    __metadata("design:type", Number)
], MediaMetadataDto.prototype, "framerate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Color space' }),
    __metadata("design:type", String)
], MediaMetadataDto.prototype, "colorSpace", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    __metadata("design:type", Object)
], MediaMetadataDto.prototype, "additional", void 0);
class MediaResponseDto {
    id;
    filename;
    originalName;
    mimeType;
    size;
    url;
    thumbnailUrl;
    category;
    entityType;
    entityId;
    status;
    processingJobId;
    processingError;
    metadata;
    storageProvider;
    storageKey;
    storageRegion;
    variants;
    checksum;
    isSecure;
    moderationStatus;
    moderationFlags;
    accessCount;
    lastAccessedAt;
    expiresAt;
    isOrphan;
    uploadRegion;
    compressionLevel;
    bandwidthOptimized;
    uploadedAt;
    createdAt;
    updatedAt;
    userId;
}
exports.MediaResponseDto = MediaResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media ID' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Generated filename' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename from user' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "originalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    __metadata("design:type", Number)
], MediaResponseDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Primary file URL' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Thumbnail URL' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media category', enum: upload_dto_1.MediaCategory }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity type', enum: upload_dto_1.MediaEntityType }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Entity ID' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing status', enum: MediaStatus }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Processing job ID' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "processingJobId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Processing error message' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "processingError", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File metadata', type: MediaMetadataDto }),
    __metadata("design:type", MediaMetadataDto)
], MediaResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage provider', enum: StorageProvider }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "storageProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage key' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "storageKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Storage region' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "storageRegion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quality variants', type: [MediaVariantDto] }),
    __metadata("design:type", Array)
], MediaResponseDto.prototype, "variants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File checksum' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "checksum", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Passed security checks' }),
    __metadata("design:type", Boolean)
], MediaResponseDto.prototype, "isSecure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Moderation status', enum: ModerationStatus }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "moderationStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Moderation flags' }),
    __metadata("design:type", Array)
], MediaResponseDto.prototype, "moderationFlags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access count' }),
    __metadata("design:type", Number)
], MediaResponseDto.prototype, "accessCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last accessed timestamp' }),
    __metadata("design:type", Date)
], MediaResponseDto.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File expiry timestamp' }),
    __metadata("design:type", Date)
], MediaResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is orphaned (not linked to entity)' }),
    __metadata("design:type", Boolean)
], MediaResponseDto.prototype, "isOrphan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload region' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "uploadRegion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compression level', enum: upload_dto_1.CompressionLevel }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "compressionLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bandwidth optimized' }),
    __metadata("design:type", Boolean)
], MediaResponseDto.prototype, "bandwidthOptimized", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload timestamp' }),
    __metadata("design:type", Date)
], MediaResponseDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], MediaResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update timestamp' }),
    __metadata("design:type", Date)
], MediaResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "userId", void 0);
class MediaListResponseDto {
    items;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.MediaListResponseDto = MediaListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media items', type: [MediaResponseDto] }),
    __metadata("design:type", Array)
], MediaListResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total count' }),
    __metadata("design:type", Number)
], MediaListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page' }),
    __metadata("design:type", Number)
], MediaListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page' }),
    __metadata("design:type", Number)
], MediaListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total pages' }),
    __metadata("design:type", Number)
], MediaListResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Has next page' }),
    __metadata("design:type", Boolean)
], MediaListResponseDto.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Has previous page' }),
    __metadata("design:type", Boolean)
], MediaListResponseDto.prototype, "hasPrev", void 0);
class MediaUploadResponseDto {
    message;
    media;
    failed;
    uploadedCount;
    failedCount;
    processingJobs;
}
exports.MediaUploadResponseDto = MediaUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload success message' }),
    __metadata("design:type", String)
], MediaUploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Uploaded media items', type: [MediaResponseDto] }),
    __metadata("design:type", Array)
], MediaUploadResponseDto.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed uploads' }),
    __metadata("design:type", Array)
], MediaUploadResponseDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total uploaded count' }),
    __metadata("design:type", Number)
], MediaUploadResponseDto.prototype, "uploadedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total failed count' }),
    __metadata("design:type", Number)
], MediaUploadResponseDto.prototype, "failedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing jobs started' }),
    __metadata("design:type", Array)
], MediaUploadResponseDto.prototype, "processingJobs", void 0);
//# sourceMappingURL=media-response.dto.js.map