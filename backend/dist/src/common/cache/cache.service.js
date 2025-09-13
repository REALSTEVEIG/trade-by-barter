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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let CacheService = CacheService_1 = class CacheService {
    configService;
    logger = new common_1.Logger(CacheService_1.name);
    redis;
    defaultTTL = 3600;
    constructor(configService) {
        this.configService = configService;
        this.redis = new ioredis_1.default({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            connectTimeout: 10000,
            commandTimeout: 5000,
        });
        this.redis.on('connect', () => {
            this.logger.log('Connected to Redis');
        });
        this.redis.on('error', (error) => {
            this.logger.error('Redis connection error:', error);
        });
    }
    getCacheKey(key, userId, location) {
        const prefix = 'tbb:ng';
        if (userId && location) {
            return `${prefix}:${location}:${userId}:${key}`;
        }
        if (location) {
            return `${prefix}:${location}:${key}`;
        }
        if (userId) {
            return `${prefix}:user:${userId}:${key}`;
        }
        return `${prefix}:global:${key}`;
    }
    async cacheActiveListings(location, listings, ttl = 1800) {
        const key = this.getCacheKey('active_listings', undefined, location);
        try {
            await this.redis.setex(key, ttl, JSON.stringify(listings));
            this.logger.debug(`Cached ${listings.length} listings for ${location}`);
        }
        catch (error) {
            this.logger.error('Failed to cache listings:', error);
        }
    }
    async getCachedListings(location) {
        const key = this.getCacheKey('active_listings', undefined, location);
        try {
            const cached = await this.redis.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        }
        catch (error) {
            this.logger.error('Failed to get cached listings:', error);
            return null;
        }
    }
    async cacheUserProfile(userId, profile, ttl = 3600) {
        const key = this.getCacheKey('profile', userId);
        try {
            await this.redis.setex(key, ttl, JSON.stringify(profile));
        }
        catch (error) {
            this.logger.error('Failed to cache user profile:', error);
        }
    }
    async getCachedUserProfile(userId) {
        const key = this.getCacheKey('profile', userId);
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached user profile:', error);
            return null;
        }
    }
    async cacheSearchResults(searchQuery, filters, results, page = 1, ttl = 900) {
        const searchKey = this.generateSearchKey(searchQuery, filters, page);
        const key = this.getCacheKey('search', undefined, searchKey);
        try {
            await this.redis.setex(key, ttl, JSON.stringify(results));
        }
        catch (error) {
            this.logger.error('Failed to cache search results:', error);
        }
    }
    async getCachedSearchResults(searchQuery, filters, page = 1) {
        const searchKey = this.generateSearchKey(searchQuery, filters, page);
        const key = this.getCacheKey('search', undefined, searchKey);
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached search results:', error);
            return null;
        }
    }
    async cacheCategories(categories, ttl = 7200) {
        const key = this.getCacheKey('categories');
        try {
            await this.redis.setex(key, ttl, JSON.stringify(categories));
        }
        catch (error) {
            this.logger.error('Failed to cache categories:', error);
        }
    }
    async getCachedCategories() {
        const key = this.getCacheKey('categories');
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached categories:', error);
            return null;
        }
    }
    async cacheLocationData(locations, ttl = 86400) {
        const key = this.getCacheKey('nigeria_locations');
        try {
            await this.redis.setex(key, ttl, JSON.stringify(locations));
        }
        catch (error) {
            this.logger.error('Failed to cache location data:', error);
        }
    }
    async getCachedLocationData() {
        const key = this.getCacheKey('nigeria_locations');
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached location data:', error);
            return null;
        }
    }
    async cacheUserActivity(userId, activity, ttl = 1800) {
        const key = this.getCacheKey('activity', userId);
        try {
            await this.redis.setex(key, ttl, JSON.stringify(activity));
        }
        catch (error) {
            this.logger.error('Failed to cache user activity:', error);
        }
    }
    async getCachedUserActivity(userId) {
        const key = this.getCacheKey('activity', userId);
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached user activity:', error);
            return null;
        }
    }
    async cacheTrendingItems(items, location, ttl = 3600) {
        const key = this.getCacheKey('trending', undefined, location || 'national');
        try {
            await this.redis.setex(key, ttl, JSON.stringify(items));
        }
        catch (error) {
            this.logger.error('Failed to cache trending items:', error);
        }
    }
    async getCachedTrendingItems(location) {
        const key = this.getCacheKey('trending', undefined, location || 'national');
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached trending items:', error);
            return null;
        }
    }
    async invalidatePattern(pattern) {
        try {
            const keys = await this.redis.keys(`tbb:ng:*${pattern}*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.debug(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to invalidate cache pattern:', error);
        }
    }
    async invalidateUserCache(userId) {
        await this.invalidatePattern(`user:${userId}`);
    }
    async invalidateLocationCache(location) {
        await this.invalidatePattern(location);
    }
    async setSession(sessionId, data, ttl = 7200) {
        const key = this.getCacheKey('session', sessionId);
        try {
            await this.redis.setex(key, ttl, JSON.stringify(data));
        }
        catch (error) {
            this.logger.error('Failed to set session:', error);
        }
    }
    async getSession(sessionId) {
        const key = this.getCacheKey('session', sessionId);
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get session:', error);
            return null;
        }
    }
    async deleteSession(sessionId) {
        const key = this.getCacheKey('session', sessionId);
        try {
            await this.redis.del(key);
        }
        catch (error) {
            this.logger.error('Failed to delete session:', error);
        }
    }
    async checkSMSRateLimit(phoneNumber, maxAttempts = 3, windowMinutes = 60) {
        const key = this.getCacheKey('sms_rate_limit', phoneNumber);
        try {
            const current = await this.redis.incr(key);
            if (current === 1) {
                await this.redis.expire(key, windowMinutes * 60);
            }
            return current <= maxAttempts;
        }
        catch (error) {
            this.logger.error('Failed to check SMS rate limit:', error);
            return true;
        }
    }
    async cacheAPIResponse(endpoint, params, response, ttl = this.defaultTTL) {
        const key = this.getCacheKey(`api:${endpoint}:${this.hashParams(params)}`);
        try {
            await this.redis.setex(key, ttl, JSON.stringify(response));
        }
        catch (error) {
            this.logger.error('Failed to cache API response:', error);
        }
    }
    async getCachedAPIResponse(endpoint, params) {
        const key = this.getCacheKey(`api:${endpoint}:${this.hashParams(params)}`);
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cached API response:', error);
            return null;
        }
    }
    async healthCheck() {
        try {
            const pong = await this.redis.ping();
            return pong === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    async getCacheStats() {
        try {
            const info = await this.redis.info('memory');
            const stats = await this.redis.info('stats');
            return {
                memory: this.parseRedisInfo(info),
                stats: this.parseRedisInfo(stats),
                connected: true,
            };
        }
        catch (error) {
            this.logger.error('Failed to get cache stats:', error);
            return { connected: false, error: error.message };
        }
    }
    async warmUpCache() {
        try {
            this.logger.log('Starting cache warm-up for Nigerian marketplace...');
            const popularLocations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'];
            for (const location of popularLocations) {
                this.logger.debug(`Cache warm-up ready for ${location}`);
            }
            this.logger.log('Cache warm-up completed');
        }
        catch (error) {
            this.logger.error('Cache warm-up failed:', error);
        }
    }
    generateSearchKey(query, filters, page) {
        const filterStr = Object.keys(filters)
            .sort()
            .map(key => `${key}:${filters[key]}`)
            .join('|');
        return `${query}:${filterStr}:page${page}`;
    }
    hashParams(params) {
        return Buffer.from(JSON.stringify(params)).toString('base64').slice(0, 32);
    }
    parseRedisInfo(info) {
        const lines = info.split('\r\n');
        const result = {};
        for (const line of lines) {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        }
        return result;
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheService);
//# sourceMappingURL=cache.service.js.map