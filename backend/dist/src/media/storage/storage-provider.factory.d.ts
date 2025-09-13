import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
export declare class StorageProviderFactory {
    private readonly configService;
    private readonly localStorageProvider;
    private readonly s3StorageProvider;
    private readonly logger;
    private readonly providers;
    constructor(configService: ConfigService, localStorageProvider: LocalStorageProvider, s3StorageProvider: S3StorageProvider);
    private initializeProviders;
    getDefaultProvider(): StorageProvider;
    getProvider(name: string): StorageProvider;
    getProviderForFileType(mimeType: string, category?: string): StorageProvider;
    getProviderForRegion(region?: string): StorageProvider;
    getProviderForFileSize(sizeInBytes: number): StorageProvider;
    getBalancedProvider(): StorageProvider;
    getFallbackProviders(primaryProvider: string): StorageProvider[];
    getAllProviders(): Array<{
        name: string;
        provider: StorageProvider;
    }>;
    checkProviderHealth(providerName: string): Promise<{
        name: string;
        healthy: boolean;
        latency?: number;
        error?: string;
    }>;
    checkAllProvidersHealth(): Promise<Array<{
        name: string;
        healthy: boolean;
        latency?: number;
        error?: string;
    }>>;
    registerProvider(name: string, provider: StorageProvider): void;
    unregisterProvider(name: string): boolean;
}
