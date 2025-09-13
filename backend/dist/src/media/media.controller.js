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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const media_service_1 = require("./services/media.service");
const upload_dto_1 = require("./dto/upload.dto");
const media_response_dto_1 = require("./dto/media-response.dto");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async uploadSingle(userId, file, uploadDto) {
        return this.mediaService.uploadSingle(userId, file, uploadDto);
    }
    async uploadMultiple(userId, files, uploadDto) {
        return this.mediaService.uploadMultiple(userId, files, uploadDto);
    }
    async uploadChunk() {
        return { message: 'Chunked upload not yet implemented' };
    }
    async getMedia(id, userId) {
        return this.mediaService.getMedia(id, userId);
    }
    async deleteMedia(id, userId) {
        return this.mediaService.deleteMedia(id, userId);
    }
    async processMedia(id) {
        return { message: 'Media processing not yet implemented' };
    }
    async getUserMedia(targetUserId, currentUserId, page, limit, category, status) {
        const userId = targetUserId === currentUserId ? targetUserId : currentUserId;
        return this.mediaService.getUserMedia(userId, page, limit, category, status);
    }
    async getMyMedia(userId, page, limit, category, status) {
        return this.mediaService.getUserMedia(userId, page, limit, category, status);
    }
    async getStorageStats(userId) {
        return this.mediaService.getStorageStats(userId);
    }
    async cleanup() {
        return { message: 'Cleanup utility not yet implemented' };
    }
    async getStats() {
        return { message: 'System statistics not yet implemented' };
    }
    async batchProcess() {
        return { message: 'Batch processing not yet implemented' };
    }
    async checkProvidersHealth() {
        return { message: 'Provider health check not yet implemented' };
    }
    async optimizeForNigeria() {
        return { message: 'Nigerian optimization not yet implemented' };
    }
    async getMediaVariants(id) {
        return { message: 'Media variants not yet implemented' };
    }
    async generateThumbnail(id) {
        return { message: 'Thumbnail generation not yet implemented' };
    }
    async addWatermark(id) {
        return { message: 'Watermark processing not yet implemented' };
    }
    async getMetadata(id) {
        return { message: 'Metadata extraction not yet implemented' };
    }
    async moderateContent(id) {
        return { message: 'Content moderation not yet implemented' };
    }
    async detectDuplicates() {
        return { message: 'Duplicate detection not yet implemented' };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload/single'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a single file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                entityType: {
                    type: 'string',
                    enum: ['USER', 'LISTING', 'CHAT', 'MESSAGE', 'OFFER', 'VERIFICATION'],
                },
                entityId: { type: 'string' },
                category: {
                    type: 'string',
                    enum: ['AVATAR', 'LISTING_IMAGE', 'CHAT_MEDIA', 'DOCUMENT', 'VERIFICATION', 'GENERAL'],
                },
                quality: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH', 'ORIGINAL'],
                },
                compressionLevel: {
                    type: 'string',
                    enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'],
                },
                uploadRegion: { type: 'string' },
                bandwidthOptimized: { type: 'boolean' },
                processImmediately: { type: 'boolean' },
                generateThumbnails: { type: 'boolean' },
                expiryHours: { type: 'number' },
                replaceExisting: { type: 'boolean' },
            },
            required: ['file', 'entityType', 'category'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded successfully',
        type: media_response_dto_1.MediaResponseDto
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    })),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, upload_dto_1.SingleUploadDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadSingle", null);
__decorate([
    (0, common_1.Post)('upload/multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple files' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                entityType: {
                    type: 'string',
                    enum: ['USER', 'LISTING', 'CHAT', 'MESSAGE', 'OFFER', 'VERIFICATION'],
                },
                entityId: { type: 'string' },
                category: {
                    type: 'string',
                    enum: ['AVATAR', 'LISTING_IMAGE', 'CHAT_MEDIA', 'DOCUMENT', 'VERIFICATION', 'GENERAL'],
                },
                quality: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH', 'ORIGINAL'],
                },
                compressionLevel: {
                    type: 'string',
                    enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'],
                },
                uploadRegion: { type: 'string' },
                bandwidthOptimized: { type: 'boolean' },
                processImmediately: { type: 'boolean' },
                generateThumbnails: { type: 'boolean' },
                expiryHours: { type: 'number' },
                maxFiles: { type: 'number' },
                maintainOrder: { type: 'boolean' },
            },
            required: ['files', 'entityType', 'category'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Files uploaded successfully',
        type: media_response_dto_1.MediaUploadResponseDto
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    })),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, upload_dto_1.MultipleUploadDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Post)('upload/chunk'),
    (0, swagger_1.ApiOperation)({ summary: 'Chunked upload for large files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chunk uploaded successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadChunk", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media details by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media details retrieved successfully',
        type: media_response_dto_1.MediaResponseDto
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Post)(':id/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger media processing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Processing started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "processMedia", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user media files' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User media retrieved successfully',
        type: media_response_dto_1.MediaListResponseDto
    }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getUserMedia", null);
__decorate([
    (0, common_1.Get)('my/files'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user media files' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User media retrieved successfully',
        type: media_response_dto_1.MediaListResponseDto
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMyMedia", null);
__decorate([
    (0, common_1.Get)('my/storage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user storage statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Storage statistics retrieved successfully' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getStorageStats", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin cleanup utility' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup completed successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "cleanup", null);
__decorate([
    (0, common_1.Get)('stats/system'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media system statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System statistics retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('batch/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch process multiple media files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch processing started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "batchProcess", null);
__decorate([
    (0, common_1.Get)('health/providers'),
    (0, swagger_1.ApiOperation)({ summary: 'Check storage providers health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Provider health status retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "checkProvidersHealth", null);
__decorate([
    (0, common_1.Post)('optimize/nigeria'),
    (0, swagger_1.ApiOperation)({ summary: 'Optimize media for Nigerian network conditions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nigerian optimization started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "optimizeForNigeria", null);
__decorate([
    (0, common_1.Get)('variants/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media variants (different quality levels)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media variants retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMediaVariants", null);
__decorate([
    (0, common_1.Post)(':id/thumbnail'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate thumbnail for media' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thumbnail generation started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "generateThumbnail", null);
__decorate([
    (0, common_1.Post)(':id/watermark'),
    (0, swagger_1.ApiOperation)({ summary: 'Add watermark to media' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Watermark processing started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "addWatermark", null);
__decorate([
    (0, common_1.Get)(':id/metadata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed media metadata' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media metadata retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMetadata", null);
__decorate([
    (0, common_1.Post)(':id/moderate'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit media for content moderation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Moderation started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "moderateContent", null);
__decorate([
    (0, common_1.Post)('duplicate/detect'),
    (0, swagger_1.ApiOperation)({ summary: 'Detect duplicate media files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Duplicate detection started successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_IMPLEMENTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "detectDuplicates", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('api/v1/media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map