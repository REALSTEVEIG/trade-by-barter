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
var ChatCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let ChatCacheService = ChatCacheService_1 = class ChatCacheService {
    configService;
    logger = new common_1.Logger(ChatCacheService_1.name);
    redisClient;
    isConnected = false;
    constructor(configService) {
        this.configService = configService;
        this.initializeRedis();
    }
    async initializeRedis() {
        try {
            const redisHost = this.configService.get('REDIS_HOST', 'localhost');
            const redisPort = this.configService.get('REDIS_PORT', 6379);
            const redisPassword = this.configService.get('REDIS_PASSWORD');
            this.redisClient = (0, redis_1.createClient)({
                socket: {
                    host: redisHost,
                    port: redisPort,
                },
                password: redisPassword,
            });
            this.redisClient.on('error', (err) => {
                this.logger.error('Redis Cache Client Error:', err);
                this.isConnected = false;
            });
            this.redisClient.on('connect', () => {
                this.logger.log('Redis Cache connected');
                this.isConnected = true;
            });
            await this.redisClient.connect();
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis cache:', error);
            this.isConnected = false;
        }
    }
    async cacheUserPresence(userId, isOnline, lastSeen) {
        if (!this.isConnected)
            return;
        try {
            const key = `user:presence:${userId}`;
            const data = JSON.stringify({
                isOnline,
                lastSeen: lastSeen.toISOString(),
                cachedAt: new Date().toISOString(),
            });
            await this.redisClient.setEx(key, 3600, data);
        }
        catch (error) {
            this.logger.error(`Failed to cache user presence for ${userId}:`, error);
        }
    }
    async getUserPresence(userId) {
        if (!this.isConnected)
            return null;
        try {
            const key = `user:presence:${userId}`;
            const cached = await this.redisClient.get(key);
            if (cached) {
                const data = JSON.parse(cached);
                return {
                    isOnline: data.isOnline,
                    lastSeen: new Date(data.lastSeen),
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to get cached user presence for ${userId}:`, error);
        }
        return null;
    }
    async cacheRecentMessages(chatId, messages, ttl = 1800) {
        if (!this.isConnected)
            return;
        try {
            const key = `chat:messages:${chatId}`;
            const data = JSON.stringify({
                messages,
                cachedAt: new Date().toISOString(),
            });
            await this.redisClient.setEx(key, ttl, data);
        }
        catch (error) {
            this.logger.error(`Failed to cache messages for chat ${chatId}:`, error);
        }
    }
    async getCachedMessages(chatId) {
        if (!this.isConnected)
            return null;
        try {
            const key = `chat:messages:${chatId}`;
            const cached = await this.redisClient.get(key);
            if (cached) {
                const data = JSON.parse(cached);
                return data.messages;
            }
        }
        catch (error) {
            this.logger.error(`Failed to get cached messages for chat ${chatId}:`, error);
        }
        return null;
    }
    async cacheUnreadCount(userId, chatId, count) {
        if (!this.isConnected)
            return;
        try {
            const key = `user:${userId}:unread:${chatId}`;
            await this.redisClient.setEx(key, 3600, count.toString());
        }
        catch (error) {
            this.logger.error(`Failed to cache unread count:`, error);
        }
    }
    async getCachedUnreadCount(userId, chatId) {
        if (!this.isConnected)
            return null;
        try {
            const key = `user:${userId}:unread:${chatId}`;
            const cached = await this.redisClient.get(key);
            if (cached) {
                return parseInt(cached, 10);
            }
        }
        catch (error) {
            this.logger.error(`Failed to get cached unread count:`, error);
        }
        return null;
    }
    async cacheChatList(userId, chats, ttl = 900) {
        if (!this.isConnected)
            return;
        try {
            const key = `user:${userId}:chats`;
            const data = JSON.stringify({
                chats,
                cachedAt: new Date().toISOString(),
            });
            await this.redisClient.setEx(key, ttl, data);
        }
        catch (error) {
            this.logger.error(`Failed to cache chat list for user ${userId}:`, error);
        }
    }
    async getCachedChatList(userId) {
        if (!this.isConnected)
            return null;
        try {
            const key = `user:${userId}:chats`;
            const cached = await this.redisClient.get(key);
            if (cached) {
                const data = JSON.parse(cached);
                return data.chats;
            }
        }
        catch (error) {
            this.logger.error(`Failed to get cached chat list for user ${userId}:`, error);
        }
        return null;
    }
    async invalidateChatCache(chatId) {
        if (!this.isConnected)
            return;
        try {
            const patterns = [
                `chat:messages:${chatId}`,
                `user:*:unread:${chatId}`,
                `user:*:chats`,
            ];
            for (const pattern of patterns) {
                if (pattern.includes('*')) {
                    const keys = await this.redisClient.keys(pattern);
                    if (keys.length > 0) {
                        await this.redisClient.del(keys);
                    }
                }
                else {
                    await this.redisClient.del(pattern);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to invalidate cache for chat ${chatId}:`, error);
        }
    }
    async invalidateUserCache(userId) {
        if (!this.isConnected)
            return;
        try {
            const patterns = [
                `user:presence:${userId}`,
                `user:${userId}:chats`,
                `user:${userId}:unread:*`,
            ];
            for (const pattern of patterns) {
                if (pattern.includes('*')) {
                    const keys = await this.redisClient.keys(pattern);
                    if (keys.length > 0) {
                        await this.redisClient.del(keys);
                    }
                }
                else {
                    await this.redisClient.del(pattern);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to invalidate cache for user ${userId}:`, error);
        }
    }
    async checkRateLimit(userId, action, limit, windowMs) {
        if (!this.isConnected)
            return true;
        try {
            const key = `rate_limit:${action}:${userId}`;
            const current = await this.redisClient.incr(key);
            if (current === 1) {
                await this.redisClient.expire(key, Math.ceil(windowMs / 1000));
            }
            return current <= limit;
        }
        catch (error) {
            this.logger.error(`Failed to check rate limit for ${userId}:`, error);
            return true;
        }
    }
    async setTypingIndicator(chatId, userId, ttl = 5) {
        if (!this.isConnected)
            return;
        try {
            const key = `typing:${chatId}:${userId}`;
            await this.redisClient.setEx(key, ttl, 'typing');
        }
        catch (error) {
            this.logger.error(`Failed to set typing indicator:`, error);
        }
    }
    async removeTypingIndicator(chatId, userId) {
        if (!this.isConnected)
            return;
        try {
            const key = `typing:${chatId}:${userId}`;
            await this.redisClient.del(key);
        }
        catch (error) {
            this.logger.error(`Failed to remove typing indicator:`, error);
        }
    }
    async getTypingUsers(chatId) {
        if (!this.isConnected)
            return [];
        try {
            const pattern = `typing:${chatId}:*`;
            const keys = await this.redisClient.keys(pattern);
            return keys.map(key => key.split(':')[2]).filter(Boolean);
        }
        catch (error) {
            this.logger.error(`Failed to get typing users for chat ${chatId}:`, error);
            return [];
        }
    }
    async incrementStat(stat, value = 1) {
        if (!this.isConnected)
            return;
        try {
            const key = `stats:${stat}`;
            await this.redisClient.incrBy(key, value);
        }
        catch (error) {
            this.logger.error(`Failed to increment stat ${stat}:`, error);
        }
    }
    async getStat(stat) {
        if (!this.isConnected)
            return 0;
        try {
            const key = `stats:${stat}`;
            const value = await this.redisClient.get(key);
            return value ? parseInt(value, 10) : 0;
        }
        catch (error) {
            this.logger.error(`Failed to get stat ${stat}:`, error);
            return 0;
        }
    }
    async healthCheck() {
        if (!this.isConnected) {
            return { redis: false };
        }
        try {
            const start = Date.now();
            await this.redisClient.ping();
            const latency = Date.now() - start;
            return { redis: true, latency };
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return { redis: false };
        }
    }
    async onModuleDestroy() {
        if (this.redisClient && this.isConnected) {
            await this.redisClient.quit();
            this.logger.log('Redis cache connection closed');
        }
    }
};
exports.ChatCacheService = ChatCacheService;
exports.ChatCacheService = ChatCacheService = ChatCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChatCacheService);
//# sourceMappingURL=cache.service.js.map