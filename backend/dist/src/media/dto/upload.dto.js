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
exports.SingleUploadDto = exports.MultipleUploadDto = exports.UploadDto = exports.ResizeOptionsDto = exports.CompressionLevel = exports.QualityLevel = exports.MediaCategory = exports.MediaEntityType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var MediaEntityType;
(function (MediaEntityType) {
    MediaEntityType["USER"] = "USER";
    MediaEntityType["LISTING"] = "LISTING";
    MediaEntityType["CHAT"] = "CHAT";
    MediaEntityType["MESSAGE"] = "MESSAGE";
    MediaEntityType["OFFER"] = "OFFER";
    MediaEntityType["VERIFICATION"] = "VERIFICATION";
})(MediaEntityType || (exports.MediaEntityType = MediaEntityType = {}));
var MediaCategory;
(function (MediaCategory) {
    MediaCategory["AVATAR"] = "AVATAR";
    MediaCategory["LISTING_IMAGE"] = "LISTING_IMAGE";
    MediaCategory["CHAT_MEDIA"] = "CHAT_MEDIA";
    MediaCategory["DOCUMENT"] = "DOCUMENT";
    MediaCategory["VERIFICATION"] = "VERIFICATION";
    MediaCategory["GENERAL"] = "GENERAL";
})(MediaCategory || (exports.MediaCategory = MediaCategory = {}));
var QualityLevel;
(function (QualityLevel) {
    QualityLevel["LOW"] = "LOW";
    QualityLevel["MEDIUM"] = "MEDIUM";
    QualityLevel["HIGH"] = "HIGH";
    QualityLevel["ORIGINAL"] = "ORIGINAL";
})(QualityLevel || (exports.QualityLevel = QualityLevel = {}));
var CompressionLevel;
(function (CompressionLevel) {
    CompressionLevel["NONE"] = "NONE";
    CompressionLevel["LOW"] = "LOW";
    CompressionLevel["MEDIUM"] = "MEDIUM";
    CompressionLevel["HIGH"] = "HIGH";
    CompressionLevel["MAXIMUM"] = "MAXIMUM";
})(CompressionLevel || (exports.CompressionLevel = CompressionLevel = {}));
class ResizeOptionsDto {
    width;
    height;
    quality;
    fit;
}
exports.ResizeOptionsDto = ResizeOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target width in pixels' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResizeOptionsDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target height in pixels' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResizeOptionsDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quality level (1-100)', minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResizeOptionsDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fit strategy for resizing' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResizeOptionsDto.prototype, "fit", void 0);
class UploadDto {
    entityType;
    entityId;
    category;
    quality;
    compressionLevel;
    resize;
    uploadRegion;
    bandwidthOptimized = true;
    processImmediately = true;
    generateThumbnails = true;
    expiryHours;
    tags;
}
exports.UploadDto = UploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity type this media belongs to' }),
    (0, class_validator_1.IsEnum)(MediaEntityType),
    __metadata("design:type", String)
], UploadDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Entity ID this media belongs to' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media category' }),
    (0, class_validator_1.IsEnum)(MediaCategory),
    __metadata("design:type", String)
], UploadDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quality level for processing' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(QualityLevel),
    __metadata("design:type", String)
], UploadDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Compression level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CompressionLevel),
    __metadata("design:type", String)
], UploadDto.prototype, "compressionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Resize options', type: ResizeOptionsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ResizeOptionsDto),
    __metadata("design:type", ResizeOptionsDto)
], UploadDto.prototype, "resize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload region for geographic optimization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDto.prototype, "uploadRegion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optimize for Nigerian bandwidth conditions', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadDto.prototype, "bandwidthOptimized", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Process immediately or queue for later', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadDto.prototype, "processImmediately", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Generate thumbnails automatically', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadDto.prototype, "generateThumbnails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File expiry time in hours' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UploadDto.prototype, "expiryHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom metadata tags' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UploadDto.prototype, "tags", void 0);
class MultipleUploadDto extends UploadDto {
    maxFiles = 10;
    maintainOrder = true;
}
exports.MultipleUploadDto = MultipleUploadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of files to process', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MultipleUploadDto.prototype, "maxFiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maintain upload order', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MultipleUploadDto.prototype, "maintainOrder", void 0);
class SingleUploadDto extends UploadDto {
    replaceExisting;
}
exports.SingleUploadDto = SingleUploadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Replace existing file if entityId matches' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SingleUploadDto.prototype, "replaceExisting", void 0);
//# sourceMappingURL=upload.dto.js.map