import { ConfigService } from '@nestjs/config';
import { StorageProvider, UploadOptions, UploadResult, UrlOptions } from '../interfaces/storage-provider.interface';
export declare class LocalStorageProvider implements StorageProvider {
    private readonly configService;
    private readonly logger;
    private readonly basePath;
    private readonly publicUrl;
    constructor(configService: ConfigService);
    private ensureDirectoryExists;
    private generateChecksum;
    private getFullPath;
    private getPublicUrl;
    upload(file: Buffer, key: string, options?: UploadOptions): Promise<UploadResult>;
    download(key: string): Promise<Buffer>;
    delete(key: string): Promise<boolean>;
    getUrl(key: string, options?: UrlOptions): string;
    listFiles(prefix?: string, limit?: number): Promise<string[]>;
    exists(key: string): Promise<boolean>;
    copy(sourceKey: string, destinationKey: string): Promise<boolean>;
    move(sourceKey: string, destinationKey: string): Promise<boolean>;
    getMetadata(key: string): Promise<Record<string, any>>;
    updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean>;
    getStorageStats(): Promise<{
        totalSize: number;
        totalFiles: number;
        availableSpace: number;
    }>;
    cleanupEmptyDirectories(): Promise<number>;
}
