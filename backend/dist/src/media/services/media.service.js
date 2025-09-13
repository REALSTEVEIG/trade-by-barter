"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_provider_factory_1 = require("../storage/storage-provider.factory");
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
let MediaService = MediaService_1 = class MediaService {
    prisma;
    configService;
    storageFactory;
    logger = new common_1.Logger(MediaService_1.name);
    constructor(prisma, configService, storageFactory) {
        this.prisma = prisma;
        this.configService = configService;
        this.storageFactory = storageFactory;
    }
    generateStorageKey(userId, filename, category) {
        const timestamp = Date.now();
        const randomSuffix = crypto.randomBytes(4).toString('hex');
        const ext = path.extname(filename);
        const baseName = path.basename(filename, ext);
        return `${category.toLowerCase()}/${userId}/${timestamp}-${randomSuffix}-${baseName}${ext}`;
    }
    generateChecksum(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    extractMetadata(buffer, mimeType) {
        const metadata = {
            size: buffer.length,
            format: mimeType.split('/')[1],
        };
        if (mimeType.startsWith('image/')) {
            metadata.width = 1920;
            metadata.height = 1080;
            metadata.colorSpace = 'sRGB';
        }
        else if (mimeType.startsWith('video/')) {
            metadata.width = 1920;
            metadata.height = 1080;
            metadata.duration = 120;
            metadata.framerate = 30;
            metadata.bitrate = '2000k';
        }
        else if (mimeType.startsWith('audio/')) {
            metadata.duration = 180;
            metadata.bitrate = '128k';
            metadata.sampleRate = 44100;
            metadata.channels = 2;
        }
        return metadata;
    }
    mapToResponseDto(media) {
        return {
            id: media.id,
            filename: media.filename,
            originalName: media.originalName,
            mimeType: media.mimeType,
            size: media.size,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            category: media.category,
            entityType: media.entityType,
            entityId: media.entityId,
            status: media.status,
            processingJobId: media.processingJobId,
            processingError: media.processingError,
            metadata: media.metadata,
            storageProvider: media.storageProvider,
            storageKey: media.storageKey,
            storageRegion: media.storageRegion,
            variants: media.variants || [],
            checksum: media.checksum,
            isSecure: media.isSecure,
            moderationStatus: media.moderationStatus,
            moderationFlags: media.moderationFlags,
            accessCount: media.accessCount,
            lastAccessedAt: media.lastAccessedAt,
            expiresAt: media.expiresAt,
            isOrphan: media.isOrphan,
            uploadRegion: media.uploadRegion,
            compressionLevel: media.compressionLevel,
            bandwidthOptimized: media.bandwidthOptimized,
            uploadedAt: media.uploadedAt,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
            userId: media.userId,
        };
    }
    async uploadSingle(userId, file, uploadDto) {
        try {
            this.logger.log(`Single upload started: ${file.originalname} by user ${userId}`);
            this.validateFile(file);
            await this.checkStorageQuota(userId, file.size);
            const storageKey = this.generateStorageKey(userId, file.originalname, uploadDto.category);
            const provider = this.storageFactory.getProviderForFileType(file.mimetype, uploadDto.category);
            const uploadResult = await provider.upload(file.buffer, storageKey, {
                contentType: file.mimetype,
                metadata: {
                    userId,
                    category: uploadDto.category,
                    originalName: file.originalname,
                },
            });
            const metadata = this.extractMetadata(file.buffer, file.mimetype);
            const expiresAt = uploadDto.expiryHours
                ? new Date(Date.now() + uploadDto.expiryHours * 60 * 60 * 1000)
                : null;
            const media = await this.prisma.media.create({
                data: {
                    filename: path.basename(storageKey),
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: uploadResult.url,
                    category: uploadDto.category,
                    entityType: uploadDto.entityType,
                    entityId: uploadDto.entityId,
                    status: 'READY',
                    metadata,
                    storageProvider: 'LOCAL',
                    storageKey,
                    storageRegion: uploadDto.uploadRegion,
                    checksum: this.generateChecksum(file.buffer),
                    isSecure: true,
                    moderationStatus: 'PENDING',
                    moderationFlags: [],
                    uploadRegion: uploadDto.uploadRegion,
                    compressionLevel: uploadDto.compressionLevel || 'MEDIUM',
                    bandwidthOptimized: uploadDto.bandwidthOptimized || true,
                    expiresAt,
                    userId,
                },
                include: {
                    variants: true,
                },
            });
            await this.updateStorageQuota(userId, file.size);
            this.logger.log(`Single upload completed: ${media.id}`);
            return this.mapToResponseDto(media);
        }
        catch (error) {
            this.logger.error(`Single upload failed: ${file.originalname}`, error.stack);
            throw error;
        }
    }
    async uploadMultiple(userId, files, uploadDto) {
        this.logger.log(`Multiple upload started: ${files.length} files by user ${userId}`);
        const results = [];
        const failed = [];
        let totalSize = 0;
        for (const file of files) {
            totalSize += file.size;
        }
        await this.checkStorageQuota(userId, totalSize);
        for (const file of files) {
            try {
                const singleDto = {
                    ...uploadDto,
                    replaceExisting: false,
                };
                const result = await this.uploadSingle(userId, file, singleDto);
                results.push(result);
            }
            catch (error) {
                failed.push({
                    filename: file.originalname,
                    error: error.message,
                });
            }
        }
        this.logger.log(`Multiple upload completed: ${results.length} successful, ${failed.length} failed`);
        return {
            message: `Upload completed: ${results.length} successful, ${failed.length} failed`,
            media: results,
            failed,
            uploadedCount: results.length,
            failedCount: failed.length,
            processingJobs: [],
        };
    }
    async getMedia(id, userId) {
        const media = await this.prisma.media.findUnique({
            where: { id },
            include: {
                variants: true,
            },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        if (userId && media.userId !== userId) {
            if (media.moderationStatus !== 'APPROVED' || !media.isSecure) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        await this.prisma.media.update({
            where: { id },
            data: {
                accessCount: { increment: 1 },
                lastAccessedAt: new Date(),
            },
        });
        return this.mapToResponseDto(media);
    }
    async getUserMedia(userId, page = 1, limit = 20, category, status) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        const [items, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                include: { variants: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.media.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            items: items.map(item => this.mapToResponseDto(item)),
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }
    async deleteMedia(id, userId) {
        const media = await this.prisma.media.findUnique({
            where: { id },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        if (media.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own media');
        }
        try {
            const provider = this.storageFactory.getProvider(media.storageProvider.toLowerCase());
            await provider.delete(media.storageKey);
            const variants = await this.prisma.mediaVariant.findMany({
                where: { mediaId: id },
            });
            for (const variant of variants) {
                await provider.delete(variant.storageKey);
            }
            await this.prisma.media.delete({ where: { id } });
            await this.updateStorageQuota(userId, -media.size);
            this.logger.log(`Media deleted: ${id}`);
            return { message: 'Media deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Failed to delete media: ${id}`, error.stack);
            throw new Error(`Failed to delete media: ${error.message}`);
        }
    }
    validateFile(file) {
        const maxSize = this.configService.get('MEDIA_MAX_FILE_SIZE', 50 * 1024 * 1024);
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
        }
        const allowedTypes = this.configService.get('MEDIA_ALLOWED_TYPES', [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/webm',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'application/pdf',
        ]);
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
        if (file.buffer.length === 0) {
            throw new common_1.BadRequestException('File is empty');
        }
    }
    async checkStorageQuota(userId, additionalSize) {
        let quota = await this.prisma.userStorageQuota.findUnique({
            where: { userId },
        });
        if (!quota) {
            quota = await this.prisma.userStorageQuota.create({
                data: {
                    userId,
                    totalQuota: BigInt(100 * 1024 * 1024),
                    usedStorage: BigInt(0),
                    mediaCount: 0,
                },
            });
        }
        const newUsage = Number(quota.usedStorage) + additionalSize;
        if (newUsage > Number(quota.totalQuota)) {
            throw new common_1.BadRequestException('Storage quota exceeded');
        }
    }
    async updateStorageQuota(userId, sizeChange) {
        await this.prisma.userStorageQuota.update({
            where: { userId },
            data: {
                usedStorage: { increment: BigInt(sizeChange) },
                mediaCount: sizeChange > 0 ? { increment: 1 } : { decrement: 1 },
                lastCalculatedAt: new Date(),
            },
        });
    }
    async getStorageStats(userId) {
        const quota = await this.prisma.userStorageQuota.findUnique({
            where: { userId },
        });
        if (!quota) {
            return {
                totalQuota: 100 * 1024 * 1024,
                usedStorage: 0,
                availableStorage: 100 * 1024 * 1024,
                usagePercentage: 0,
                mediaCount: 0,
            };
        }
        const totalQuota = Number(quota.totalQuota);
        const usedStorage = Number(quota.usedStorage);
        const availableStorage = totalQuota - usedStorage;
        const usagePercentage = (usedStorage / totalQuota) * 100;
        return {
            totalQuota,
            usedStorage,
            availableStorage,
            usagePercentage,
            mediaCount: quota.mediaCount,
        };
    }
    async cleanupExpiredMedia() {
        const expiredMedia = await this.prisma.media.findMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        let deletedCount = 0;
        for (const media of expiredMedia) {
            try {
                const provider = this.storageFactory.getProvider(media.storageProvider.toLowerCase());
                await provider.delete(media.storageKey);
                await this.prisma.media.delete({ where: { id: media.id } });
                await this.updateStorageQuota(media.userId, -media.size);
                deletedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to cleanup expired media: ${media.id}`, error.stack);
            }
        }
        this.logger.log(`Cleaned up ${deletedCount} expired media files`);
        return { deletedCount };
    }
    async cleanupOrphanedMedia() {
        const orphanedMedia = await this.prisma.media.findMany({
            where: {
                isOrphan: true,
                createdAt: {
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        });
        let deletedCount = 0;
        for (const media of orphanedMedia) {
            try {
                const provider = this.storageFactory.getProvider(media.storageProvider.toLowerCase());
                await provider.delete(media.storageKey);
                await this.prisma.media.delete({ where: { id: media.id } });
                await this.updateStorageQuota(media.userId, -media.size);
                deletedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to cleanup orphaned media: ${media.id}`, error.stack);
            }
        }
        this.logger.log(`Cleaned up ${deletedCount} orphaned media files`);
        return { deletedCount };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        storage_provider_factory_1.StorageProviderFactory])
], MediaService);
//# sourceMappingURL=media.service.js.map