import { MediaService } from './services/media.service';
import { SingleUploadDto, MultipleUploadDto } from './dto/upload.dto';
import { MediaResponseDto, MediaListResponseDto, MediaUploadResponseDto } from './dto/media-response.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadSingle(userId: string, file: Express.Multer.File, uploadDto: SingleUploadDto): Promise<MediaResponseDto>;
    uploadMultiple(userId: string, files: Express.Multer.File[], uploadDto: MultipleUploadDto): Promise<MediaUploadResponseDto>;
    uploadChunk(): Promise<{
        message: string;
    }>;
    getMedia(id: string, userId: string): Promise<MediaResponseDto>;
    deleteMedia(id: string, userId: string): Promise<{
        message: string;
    }>;
    processMedia(id: string): Promise<{
        message: string;
    }>;
    getUserMedia(targetUserId: string, currentUserId: string, page?: number, limit?: number, category?: string, status?: string): Promise<MediaListResponseDto>;
    getMyMedia(userId: string, page?: number, limit?: number, category?: string, status?: string): Promise<MediaListResponseDto>;
    getStorageStats(userId: string): Promise<{
        totalQuota: number;
        usedStorage: number;
        availableStorage: number;
        usagePercentage: number;
        mediaCount: number;
    }>;
    cleanup(): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        message: string;
    }>;
    batchProcess(): Promise<{
        message: string;
    }>;
    checkProvidersHealth(): Promise<{
        message: string;
    }>;
    optimizeForNigeria(): Promise<{
        message: string;
    }>;
    getMediaVariants(id: string): Promise<{
        message: string;
    }>;
    generateThumbnail(id: string): Promise<{
        message: string;
    }>;
    addWatermark(id: string): Promise<{
        message: string;
    }>;
    getMetadata(id: string): Promise<{
        message: string;
    }>;
    moderateContent(id: string): Promise<{
        message: string;
    }>;
    detectDuplicates(): Promise<{
        message: string;
    }>;
}
