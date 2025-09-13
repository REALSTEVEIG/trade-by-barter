import { ConfigService } from '@nestjs/config';
import { StorageProvider, UploadOptions, UploadResult, UrlOptions } from '../interfaces/storage-provider.interface';
export declare class S3StorageProvider implements StorageProvider {
    private readonly configService;
    private readonly logger;
    private readonly bucket;
    private readonly region;
    private readonly accessKey;
    private readonly secretKey;
    private readonly endpoint?;
    constructor(configService: ConfigService);
    private simulateDelay;
    private generateMockETag;
    private getS3Url;
    upload(file: Buffer, key: string, options?: UploadOptions): Promise<UploadResult>;
    download(key: string): Promise<Buffer>;
    delete(key: string): Promise<boolean>;
    getUrl(key: string, options?: UrlOptions): string;
    getSignedUrl(key: string, operation: 'getObject' | 'putObject', expiry?: number): Promise<string>;
    listFiles(prefix?: string, limit?: number): Promise<string[]>;
    exists(key: string): Promise<boolean>;
    copy(sourceKey: string, destinationKey: string): Promise<boolean>;
    move(sourceKey: string, destinationKey: string): Promise<boolean>;
    getMetadata(key: string): Promise<Record<string, any>>;
    updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean>;
    initiateMultipartUpload(key: string, options?: UploadOptions): Promise<{
        uploadId: string;
        bucket: string;
        key: string;
    }>;
    getUploadPartUrl(bucket: string, key: string, uploadId: string, partNumber: number): Promise<string>;
    completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: Array<{
        partNumber: number;
        etag: string;
    }>): Promise<UploadResult>;
    abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<boolean>;
}
