export interface UploadOptions {
    bucket?: string;
    region?: string;
    acl?: 'private' | 'public-read' | 'public-read-write';
    contentType?: string;
    metadata?: Record<string, string>;
    tags?: Record<string, string>;
}
export interface UploadResult {
    key: string;
    url: string;
    size: number;
    checksum?: string;
    metadata?: Record<string, any>;
}
export interface UrlOptions {
    expiry?: number;
    download?: boolean;
    filename?: string;
}
export interface StorageProvider {
    upload(file: Buffer, key: string, options?: UploadOptions): Promise<UploadResult>;
    download(key: string): Promise<Buffer>;
    delete(key: string): Promise<boolean>;
    getUrl(key: string, options?: UrlOptions): string | Promise<string>;
    listFiles(prefix?: string, limit?: number): Promise<string[]>;
    exists(key: string): Promise<boolean>;
    copy(sourceKey: string, destinationKey: string): Promise<boolean>;
    move(sourceKey: string, destinationKey: string): Promise<boolean>;
    getMetadata(key: string): Promise<Record<string, any>>;
    updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean>;
}
export interface StorageConfig {
    provider: 'local' | 's3' | 'cloudinary' | 'azure' | 'gcs';
    region?: string;
    bucket?: string;
    accessKey?: string;
    secretKey?: string;
    endpoint?: string;
    basePath?: string;
    publicUrl?: string;
}
