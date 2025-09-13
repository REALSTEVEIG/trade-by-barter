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
var StorageProviderFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const local_storage_provider_1 = require("./local-storage.provider");
const s3_storage_provider_1 = require("./s3-storage.provider");
let StorageProviderFactory = StorageProviderFactory_1 = class StorageProviderFactory {
    configService;
    localStorageProvider;
    s3StorageProvider;
    logger = new common_1.Logger(StorageProviderFactory_1.name);
    providers = new Map();
    constructor(configService, localStorageProvider, s3StorageProvider) {
        this.configService = configService;
        this.localStorageProvider = localStorageProvider;
        this.s3StorageProvider = s3StorageProvider;
        this.initializeProviders();
    }
    initializeProviders() {
        this.providers.set('local', this.localStorageProvider);
        this.providers.set('s3', this.s3StorageProvider);
        this.logger.log(`Initialized ${this.providers.size} storage providers`);
    }
    getDefaultProvider() {
        const defaultProvider = this.configService.get('MEDIA_DEFAULT_PROVIDER', 'local');
        return this.getProvider(defaultProvider);
    }
    getProvider(name) {
        const provider = this.providers.get(name.toLowerCase());
        if (!provider) {
            this.logger.warn(`Storage provider '${name}' not found, falling back to local`);
            return this.providers.get('local');
        }
        return provider;
    }
    getProviderForFileType(mimeType, category) {
        const providerConfig = this.configService.get('MEDIA_PROVIDER_CONFIG', {});
        if (category) {
            const categoryProvider = providerConfig[`category_${category.toLowerCase()}`];
            if (categoryProvider && this.providers.has(categoryProvider)) {
                return this.providers.get(categoryProvider);
            }
        }
        const mimeTypeProvider = providerConfig[`mimetype_${mimeType.replace('/', '_')}`];
        if (mimeTypeProvider && this.providers.has(mimeTypeProvider)) {
            return this.providers.get(mimeTypeProvider);
        }
        if (mimeType.startsWith('image/')) {
            const imageProvider = providerConfig['images'] || this.configService.get('MEDIA_IMAGE_PROVIDER');
            if (imageProvider && this.providers.has(imageProvider)) {
                return this.providers.get(imageProvider);
            }
        }
        if (mimeType.startsWith('video/')) {
            const videoProvider = providerConfig['videos'] || this.configService.get('MEDIA_VIDEO_PROVIDER');
            if (videoProvider && this.providers.has(videoProvider)) {
                return this.providers.get(videoProvider);
            }
        }
        if (mimeType.startsWith('audio/')) {
            const audioProvider = providerConfig['audio'] || this.configService.get('MEDIA_AUDIO_PROVIDER');
            if (audioProvider && this.providers.has(audioProvider)) {
                return this.providers.get(audioProvider);
            }
        }
        return this.getDefaultProvider();
    }
    getProviderForRegion(region) {
        if (!region) {
            return this.getDefaultProvider();
        }
        const regionConfig = this.configService.get('MEDIA_REGION_CONFIG', {});
        const nigerianCities = ['lagos', 'abuja', 'port-harcourt', 'kano', 'ibadan'];
        const normalizedRegion = region.toLowerCase().replace(/\s+/g, '-');
        if (nigerianCities.includes(normalizedRegion)) {
            const regionProvider = regionConfig[normalizedRegion] || regionConfig['nigeria'];
            if (regionProvider && this.providers.has(regionProvider)) {
                this.logger.log(`Using optimized provider for Nigerian region: ${region}`);
                return this.providers.get(regionProvider);
            }
        }
        return this.getDefaultProvider();
    }
    getProviderForFileSize(sizeInBytes) {
        const sizeConfig = this.configService.get('MEDIA_SIZE_CONFIG', {});
        if (sizeInBytes > 100 * 1024 * 1024) {
            const largeFileProvider = sizeConfig['large_files'];
            if (largeFileProvider && this.providers.has(largeFileProvider)) {
                this.logger.log(`Using specialized provider for large file: ${sizeInBytes} bytes`);
                return this.providers.get(largeFileProvider);
            }
        }
        if (sizeInBytes < 1024 * 1024) {
            const smallFileProvider = sizeConfig['small_files'];
            if (smallFileProvider && this.providers.has(smallFileProvider)) {
                return this.providers.get(smallFileProvider);
            }
        }
        return this.getDefaultProvider();
    }
    getBalancedProvider() {
        const enableLoadBalancing = this.configService.get('MEDIA_LOAD_BALANCING', false);
        if (!enableLoadBalancing) {
            return this.getDefaultProvider();
        }
        const availableProviders = Array.from(this.providers.values());
        const selectedIndex = Math.floor(Math.random() * availableProviders.length);
        this.logger.log(`Load balanced provider selection: index ${selectedIndex}`);
        return availableProviders[selectedIndex];
    }
    getFallbackProviders(primaryProvider) {
        const fallbackConfig = this.configService.get('MEDIA_FALLBACK_CONFIG', {});
        const fallbacks = fallbackConfig[primaryProvider] || ['local'];
        const providers = [];
        for (const fallback of fallbacks) {
            const provider = this.providers.get(fallback);
            if (provider) {
                providers.push(provider);
            }
        }
        if (providers.length === 0) {
            providers.push(this.providers.get('local'));
        }
        return providers;
    }
    getAllProviders() {
        return Array.from(this.providers.entries()).map(([name, provider]) => ({
            name,
            provider,
        }));
    }
    async checkProviderHealth(providerName) {
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
        }
        catch (error) {
            return {
                name: providerName,
                healthy: false,
                error: error.message,
            };
        }
    }
    async checkAllProvidersHealth() {
        const results = await Promise.allSettled(Array.from(this.providers.keys()).map(name => this.checkProviderHealth(name)));
        return results.map((result, index) => {
            const providerName = Array.from(this.providers.keys())[index];
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                return {
                    name: providerName,
                    healthy: false,
                    error: result.reason?.message || 'Unknown error',
                };
            }
        });
    }
    registerProvider(name, provider) {
        this.providers.set(name.toLowerCase(), provider);
        this.logger.log(`Registered new storage provider: ${name}`);
    }
    unregisterProvider(name) {
        const removed = this.providers.delete(name.toLowerCase());
        if (removed) {
            this.logger.log(`Unregistered storage provider: ${name}`);
        }
        return removed;
    }
};
exports.StorageProviderFactory = StorageProviderFactory;
exports.StorageProviderFactory = StorageProviderFactory = StorageProviderFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        local_storage_provider_1.LocalStorageProvider,
        s3_storage_provider_1.S3StorageProvider])
], StorageProviderFactory);
//# sourceMappingURL=storage-provider.factory.js.map