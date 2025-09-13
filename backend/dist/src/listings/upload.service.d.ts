import { PrismaService } from '../prisma/prisma.service';
export declare class UploadService {
    private readonly prisma;
    private readonly uploadDir;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    private ensureUploadDirectory;
    private generateFileName;
    private validateFile;
    uploadListingImages(listingId: string, userId: string, files: Express.Multer.File[]): Promise<{
        message: string;
        urls: string[];
    }>;
    deleteListingImage(listingId: string, imageId: string, userId: string): Promise<{
        message: string;
    }>;
    getListingImages(listingId: string): Promise<string[]>;
}
