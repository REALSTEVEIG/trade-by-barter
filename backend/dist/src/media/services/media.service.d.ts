import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageProviderFactory } from '../storage/storage-provider.factory';
import { SingleUploadDto, MultipleUploadDto } from '../dto/upload.dto';
import { MediaResponseDto, MediaListResponseDto, MediaUploadResponseDto } from '../dto/media-response.dto';
export declare class MediaService {
    private readonly prisma;
    private readonly configService;
    private readonly storageFactory;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, storageFactory: StorageProviderFactory);
    private generateStorageKey;
    private generateChecksum;
    private extractMetadata;
    private mapToResponseDto;
    uploadSingle(userId: string, file: Express.Multer.File, uploadDto: SingleUploadDto): Promise<MediaResponseDto>;
    uploadMultiple(userId: string, files: Express.Multer.File[], uploadDto: MultipleUploadDto): Promise<MediaUploadResponseDto>;
    getMedia(id: string, userId?: string): Promise<MediaResponseDto>;
    getUserMedia(userId: string, page?: number, limit?: number, category?: string, status?: string): Promise<MediaListResponseDto>;
    deleteMedia(id: string, userId: string): Promise<{
        message: string;
    }>;
    private validateFile;
    private checkStorageQuota;
    private updateStorageQuota;
    getStorageStats(userId: string): Promise<{
        totalQuota: number;
        usedStorage: number;
        availableStorage: number;
        usagePercentage: number;
        mediaCount: number;
    }>;
    cleanupExpiredMedia(): Promise<{
        deletedCount: number;
    }>;
    cleanupOrphanedMedia(): Promise<{
        deletedCount: number;
    }>;
}
