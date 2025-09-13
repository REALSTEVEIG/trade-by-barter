import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, StorageConfig } from '../interfaces/storage-provider.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

@Injectable()
export class StorageProviderFactory {
  private readonly logger = new Logger(StorageProviderFactory.name);
  private readonly providers = new Map<string, StorageProvider>();

  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly s3StorageProvider: S3StorageProvider,
  ) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Register available providers
    this.providers.set('local', this.localStorageProvider);
    this.providers.set('s3', this.s3StorageProvider);

    this.logger.log(`Initialized ${this.providers.size} storage providers`);
  }

  /**
   * Get the default storage provider
   */
  getDefaultProvider(): StorageProvider {
    const defaultProvider = this.configService.get<string>('MEDIA_DEFAULT_PROVIDER', 'local');
    return this.getProvider(defaultProvider);
  }

  /**
   * Get a specific storage provider
   */
  getProvider(name: string): StorageProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      this.logger.warn(`Storage provider '${name}' not found, falling back to local`);
      return this.providers.get('local')!;
    }
    return provider;
  }

  /**
   * Get provider for specific file type or category
   */
  getProviderForFileType(mimeType: string, category?: string): StorageProvider {
    // Define provider selection logic based on file type and category
    const providerConfig = this.configService.get<Record<string, string>>('MEDIA_PROVIDER_CONFIG', {});
    
    // Check for category-specific provider
    if (category) {
      const categoryProvider = providerConfig[`category_${category.toLowerCase()}`];
      if (categoryProvider && this.providers.has(categoryProvider)) {
        return this.providers.get(categoryProvider)!;
      }
    }

    // Check for MIME type specific provider
    const mimeTypeProvider = providerConfig[`mimetype_${mimeType.replace('/', '_')}`];
    if (mimeTypeProvider && this.providers.has(mimeTypeProvider)) {
      return this.providers.get(mimeTypeProvider)!;
    }

    // File type based selection
    if (mimeType.startsWith('image/')) {
      const imageProvider = providerConfig['images'] || this.configService.get<string>('MEDIA_IMAGE_PROVIDER');
      if (imageProvider && this.providers.has(imageProvider)) {
        return this.providers.get(imageProvider)!;
      }
    }

    if (mimeType.startsWith('video/')) {
      const videoProvider = providerConfig['videos'] || this.configService.get<string>('MEDIA_VIDEO_PROVIDER');
      if (videoProvider && this.providers.has(videoProvider)) {
        return this.providers.get(videoProvider)!;
      }
    }

    if (mimeType.startsWith('audio/')) {
      const audioProvider = providerConfig['audio'] || this.configService.get<string>('MEDIA_AUDIO_PROVIDER');
      if (audioProvider && this.providers.has(audioProvider)) {
        return this.providers.get(audioProvider)!;
      }
    }

    // Default provider
    return this.getDefaultProvider();
  }

  /**
   * Get provider for geographic region (Nigerian optimization)
   */
  getProviderForRegion(region?: string): StorageProvider {
    if (!region) {
      return this.getDefaultProvider();
    }

    const regionConfig = this.configService.get<Record<string, string>>('MEDIA_REGION_CONFIG', {});
    
    // Nigerian major cities optimization
    const nigerianCities = ['lagos', 'abuja', 'port-harcourt', 'kano', 'ibadan'];
    const normalizedRegion = region.toLowerCase().replace(/\s+/g, '-');
    
    if (nigerianCities.includes(normalizedRegion)) {
      const regionProvider = regionConfig[normalizedRegion] || regionConfig['nigeria'];
      if (regionProvider && this.providers.has(regionProvider)) {
        this.logger.log(`Using optimized provider for Nigerian region: ${region}`);
        return this.providers.get(regionProvider)!;
      }
    }

    return this.getDefaultProvider();
  }

  /**
   * Get provider based on file size (for large files)
   */
  getProviderForFileSize(sizeInBytes: number): StorageProvider {
    const sizeConfig = this.configService.get<Record<string, any>>('MEDIA_SIZE_CONFIG', {});
    
    // Large files (>100MB) might need different handling
    if (sizeInBytes > 100 * 1024 * 1024) {
      const largeFileProvider = sizeConfig['large_files'];
      if (largeFileProvider && this.providers.has(largeFileProvider)) {
        this.logger.log(`Using specialized provider for large file: ${sizeInBytes} bytes`);
        return this.providers.get(largeFileProvider)!;
      }
    }

    // Small files (<1MB) might be suitable for different storage
    if (sizeInBytes < 1024 * 1024) {
      const smallFileProvider = sizeConfig['small_files'];
      if (smallFileProvider && this.providers.has(smallFileProvider)) {
        return this.providers.get(smallFileProvider)!;
      }
    }

    return this.getDefaultProvider();
  }

  /**
   * Get provider with load balancing
   */
  getBalancedProvider(): StorageProvider {
    const enableLoadBalancing = this.configService.get<boolean>('MEDIA_LOAD_BALANCING', false);
    
    if (!enableLoadBalancing) {
      return this.getDefaultProvider();
    }

    // Simple round-robin load balancing
    const availableProviders = Array.from(this.providers.values());
    const selectedIndex = Math.floor(Math.random() * availableProviders.length);
    
    this.logger.log(`Load balanced provider selection: index ${selectedIndex}`);
    return availableProviders[selectedIndex];
  }

  /**
   * Get fallback provider chain
   */
  getFallbackProviders(primaryProvider: string): StorageProvider[] {
    const fallbackConfig = this.configService.get<Record<string, string[]>>('MEDIA_FALLBACK_CONFIG', {});
    const fallbacks = fallbackConfig[primaryProvider] || ['local'];
    
    const providers: StorageProvider[] = [];
    
    for (const fallback of fallbacks) {
      const provider = this.providers.get(fallback);
      if (provider) {
        providers.push(provider);
      }
    }

    // Ensure we always have at least the local provider as fallback
    if (providers.length === 0) {
      providers.push(this.providers.get('local')!);
    }

    return providers;
  }

  /**
   * Get all available providers
   */
  getAllProviders(): Array<{ name: string; provider: StorageProvider }> {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      provider,
    }));
  }

  /**
   * Check provider health
   */
  async checkProviderHealth(providerName: string): Promise<{
    name: string;
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return {
        name: providerName,
        healthy: false,
        error: 'Provider not found',
      };
    }

    try {
      const startTime = Date.now();
      
      // Test basic functionality
      const testKey = `health-check/${Date.now()}.txt`;
      const testData = Buffer.from('health check', 'utf-8');
      
      await provider.upload(testData, testKey);
      await provider.exists(testKey);
      await provider.delete(testKey);
      
      const latency = Date.now() - startTime;
      
      return {
        name: providerName,
        healthy: true,
        latency,
      };
    } catch (error) {
      return {
        name: providerName,
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check health of all providers
   */
  async checkAllProvidersHealth(): Promise<Array<{
    name: string;
    healthy: boolean;
    latency?: number;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      Array.from(this.providers.keys()).map(name => this.checkProviderHealth(name))
    );

    return results.map((result, index) => {
      const providerName = Array.from(this.providers.keys())[index];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: providerName,
          healthy: false,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  /**
   * Register a new storage provider
   */
  registerProvider(name: string, provider: StorageProvider): void {
    this.providers.set(name.toLowerCase(), provider);
    this.logger.log(`Registered new storage provider: ${name}`);
  }

  /**
   * Unregister a storage provider
   */
  unregisterProvider(name: string): boolean {
    const removed = this.providers.delete(name.toLowerCase());
    if (removed) {
      this.logger.log(`Unregistered storage provider: ${name}`);
    }
    return removed;
  }
}