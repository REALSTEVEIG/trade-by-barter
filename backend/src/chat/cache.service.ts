import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class ChatCacheService {
  private readonly logger = new Logger(ChatCacheService.name);
  private redisClient: RedisClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

      this.redisClient = createClient({
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
    } catch (error) {
      this.logger.error('Failed to connect to Redis cache:', error);
      this.isConnected = false;
    }
  }

  // Cache user presence data
  async cacheUserPresence(userId: string, isOnline: boolean, lastSeen: Date): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `user:presence:${userId}`;
      const data = JSON.stringify({
        isOnline,
        lastSeen: lastSeen.toISOString(),
        cachedAt: new Date().toISOString(),
      });

      await this.redisClient.setEx(key, 3600, data); // Cache for 1 hour
    } catch (error) {
      this.logger.error(`Failed to cache user presence for ${userId}:`, error);
    }
  }

  // Get cached user presence
  async getUserPresence(userId: string): Promise<{ isOnline: boolean; lastSeen: Date } | null> {
    if (!this.isConnected) return null;

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
    } catch (error) {
      this.logger.error(`Failed to get cached user presence for ${userId}:`, error);
    }

    return null;
  }

  // Cache chat messages for quick retrieval
  async cacheRecentMessages(chatId: string, messages: any[], ttl: number = 1800): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `chat:messages:${chatId}`;
      const data = JSON.stringify({
        messages,
        cachedAt: new Date().toISOString(),
      });

      await this.redisClient.setEx(key, ttl, data); // Cache for 30 minutes by default
    } catch (error) {
      this.logger.error(`Failed to cache messages for chat ${chatId}:`, error);
    }
  }

  // Get cached recent messages
  async getCachedMessages(chatId: string): Promise<any[] | null> {
    if (!this.isConnected) return null;

    try {
      const key = `chat:messages:${chatId}`;
      const cached = await this.redisClient.get(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        return data.messages;
      }
    } catch (error) {
      this.logger.error(`Failed to get cached messages for chat ${chatId}:`, error);
    }

    return null;
  }

  // Cache unread message count
  async cacheUnreadCount(userId: string, chatId: string, count: number): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `user:${userId}:unread:${chatId}`;
      await this.redisClient.setEx(key, 3600, count.toString()); // Cache for 1 hour
    } catch (error) {
      this.logger.error(`Failed to cache unread count:`, error);
    }
  }

  // Get cached unread count
  async getCachedUnreadCount(userId: string, chatId: string): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      const key = `user:${userId}:unread:${chatId}`;
      const cached = await this.redisClient.get(key);
      
      if (cached) {
        return parseInt(cached, 10);
      }
    } catch (error) {
      this.logger.error(`Failed to get cached unread count:`, error);
    }

    return null;
  }

  // Cache chat list for user
  async cacheChatList(userId: string, chats: any[], ttl: number = 900): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `user:${userId}:chats`;
      const data = JSON.stringify({
        chats,
        cachedAt: new Date().toISOString(),
      });

      await this.redisClient.setEx(key, ttl, data); // Cache for 15 minutes by default
    } catch (error) {
      this.logger.error(`Failed to cache chat list for user ${userId}:`, error);
    }
  }

  // Get cached chat list
  async getCachedChatList(userId: string): Promise<any[] | null> {
    if (!this.isConnected) return null;

    try {
      const key = `user:${userId}:chats`;
      const cached = await this.redisClient.get(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        return data.chats;
      }
    } catch (error) {
      this.logger.error(`Failed to get cached chat list for user ${userId}:`, error);
    }

    return null;
  }

  // Invalidate cache for specific chat
  async invalidateChatCache(chatId: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const patterns = [
        `chat:messages:${chatId}`,
        `user:*:unread:${chatId}`,
        `user:*:chats`, // Invalidate all user chat lists
      ];

      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          // For wildcard patterns, we need to get all matching keys first
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(keys);
          }
        } else {
          await this.redisClient.del(pattern);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for chat ${chatId}:`, error);
    }
  }

  // Invalidate user cache
  async invalidateUserCache(userId: string): Promise<void> {
    if (!this.isConnected) return;

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
        } else {
          await this.redisClient.del(pattern);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for user ${userId}:`, error);
    }
  }

  // Rate limiting with Redis
  async checkRateLimit(userId: string, action: string, limit: number, windowMs: number): Promise<boolean> {
    if (!this.isConnected) return true; // Allow if Redis is not available

    try {
      const key = `rate_limit:${action}:${userId}`;
      const current = await this.redisClient.incr(key);
      
      if (current === 1) {
        // Set expiration on first increment
        await this.redisClient.expire(key, Math.ceil(windowMs / 1000));
      }
      
      return current <= limit;
    } catch (error) {
      this.logger.error(`Failed to check rate limit for ${userId}:`, error);
      return true; // Allow on error
    }
  }

  // Store typing indicators
  async setTypingIndicator(chatId: string, userId: string, ttl: number = 5): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `typing:${chatId}:${userId}`;
      await this.redisClient.setEx(key, ttl, 'typing');
    } catch (error) {
      this.logger.error(`Failed to set typing indicator:`, error);
    }
  }

  // Remove typing indicator
  async removeTypingIndicator(chatId: string, userId: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `typing:${chatId}:${userId}`;
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to remove typing indicator:`, error);
    }
  }

  // Get typing users for a chat
  async getTypingUsers(chatId: string): Promise<string[]> {
    if (!this.isConnected) return [];

    try {
      const pattern = `typing:${chatId}:*`;
      const keys = await this.redisClient.keys(pattern);
      
      return keys.map(key => key.split(':')[2]).filter(Boolean);
    } catch (error) {
      this.logger.error(`Failed to get typing users for chat ${chatId}:`, error);
      return [];
    }
  }

  // Cache statistics for analytics
  async incrementStat(stat: string, value: number = 1): Promise<void> {
    if (!this.isConnected) return;

    try {
      const key = `stats:${stat}`;
      await this.redisClient.incrBy(key, value);
    } catch (error) {
      this.logger.error(`Failed to increment stat ${stat}:`, error);
    }
  }

  // Get statistics
  async getStat(stat: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const key = `stats:${stat}`;
      const value = await this.redisClient.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      this.logger.error(`Failed to get stat ${stat}:`, error);
      return 0;
    }
  }

  // Health check
  async healthCheck(): Promise<{ redis: boolean; latency?: number }> {
    if (!this.isConnected) {
      return { redis: false };
    }

    try {
      const start = Date.now();
      await this.redisClient.ping();
      const latency = Date.now() - start;
      
      return { redis: true, latency };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return { redis: false };
    }
  }

  // Cleanup on module destroy
  async onModuleDestroy(): Promise<void> {
    if (this.redisClient && this.isConnected) {
      await this.redisClient.quit();
      this.logger.log('Redis cache connection closed');
    }
  }
}