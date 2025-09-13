import { ConfigService } from '@nestjs/config';
export declare class ChatCacheService {
    private readonly configService;
    private readonly logger;
    private redisClient;
    private isConnected;
    constructor(configService: ConfigService);
    private initializeRedis;
    cacheUserPresence(userId: string, isOnline: boolean, lastSeen: Date): Promise<void>;
    getUserPresence(userId: string): Promise<{
        isOnline: boolean;
        lastSeen: Date;
    } | null>;
    cacheRecentMessages(chatId: string, messages: any[], ttl?: number): Promise<void>;
    getCachedMessages(chatId: string): Promise<any[] | null>;
    cacheUnreadCount(userId: string, chatId: string, count: number): Promise<void>;
    getCachedUnreadCount(userId: string, chatId: string): Promise<number | null>;
    cacheChatList(userId: string, chats: any[], ttl?: number): Promise<void>;
    getCachedChatList(userId: string): Promise<any[] | null>;
    invalidateChatCache(chatId: string): Promise<void>;
    invalidateUserCache(userId: string): Promise<void>;
    checkRateLimit(userId: string, action: string, limit: number, windowMs: number): Promise<boolean>;
    setTypingIndicator(chatId: string, userId: string, ttl?: number): Promise<void>;
    removeTypingIndicator(chatId: string, userId: string): Promise<void>;
    getTypingUsers(chatId: string): Promise<string[]>;
    incrementStat(stat: string, value?: number): Promise<void>;
    getStat(stat: string): Promise<number>;
    healthCheck(): Promise<{
        redis: boolean;
        latency?: number;
    }>;
    onModuleDestroy(): Promise<void>;
}
