import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private readonly redis: Redis
  private readonly defaultTTL = 3600 // 1 hour default

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis')
    })

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error)
    })
  }

  /**
   * Nigerian marketplace specific cache keys
   */
  private getCacheKey(key: string, userId?: string, location?: string): string {
    const prefix = 'tbb:ng'
    if (userId && location) {
      return `${prefix}:${location}:${userId}:${key}`
    }
    if (location) {
      return `${prefix}:${location}:${key}`
    }
    if (userId) {
      return `${prefix}:user:${userId}:${key}`
    }
    return `${prefix}:global:${key}`
  }

  /**
   * Cache active listings for specific Nigerian locations
   */
  async cacheActiveListings(
    location: string,
    listings: any[],
    ttl: number = 1800, // 30 minutes
  ): Promise<void> {
    const key = this.getCacheKey('active_listings', undefined, location)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(listings))
      this.logger.debug(`Cached ${listings.length} listings for ${location}`)
    } catch (error) {
      this.logger.error('Failed to cache listings:', error)
    }
  }

  /**
   * Get cached listings for Nigerian location
   */
  async getCachedListings(location: string): Promise<any[] | null> {
    const key = this.getCacheKey('active_listings', undefined, location)
    try {
      const cached = await this.redis.get(key)
      if (cached) {
        return JSON.parse(cached)
      }
      return null
    } catch (error) {
      this.logger.error('Failed to get cached listings:', error)
      return null
    }
  }

  /**
   * Cache user profile data
   */
  async cacheUserProfile(
    userId: string,
    profile: any,
    ttl: number = 3600, // 1 hour
  ): Promise<void> {
    const key = this.getCacheKey('profile', userId)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(profile))
    } catch (error) {
      this.logger.error('Failed to cache user profile:', error)
    }
  }

  /**
   * Get cached user profile
   */
  async getCachedUserProfile(userId: string): Promise<any | null> {
    const key = this.getCacheKey('profile', userId)
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached user profile:', error)
      return null
    }
  }

  /**
   * Cache search results with pagination
   */
  async cacheSearchResults(
    searchQuery: string,
    filters: any,
    results: any,
    page: number = 1,
    ttl: number = 900, // 15 minutes
  ): Promise<void> {
    const searchKey = this.generateSearchKey(searchQuery, filters, page)
    const key = this.getCacheKey('search', undefined, searchKey)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(results))
    } catch (error) {
      this.logger.error('Failed to cache search results:', error)
    }
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(
    searchQuery: string,
    filters: any,
    page: number = 1,
  ): Promise<any | null> {
    const searchKey = this.generateSearchKey(searchQuery, filters, page)
    const key = this.getCacheKey('search', undefined, searchKey)
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached search results:', error)
      return null
    }
  }

  /**
   * Cache Nigerian categories and subcategories
   */
  async cacheCategories(categories: any[], ttl: number = 7200): Promise<void> {
    const key = this.getCacheKey('categories')
    try {
      await this.redis.setex(key, ttl, JSON.stringify(categories))
    } catch (error) {
      this.logger.error('Failed to cache categories:', error)
    }
  }

  /**
   * Get cached categories
   */
  async getCachedCategories(): Promise<any[] | null> {
    const key = this.getCacheKey('categories')
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached categories:', error)
      return null
    }
  }

  /**
   * Cache Nigerian location data (states, cities)
   */
  async cacheLocationData(locations: any[], ttl: number = 86400): Promise<void> {
    const key = this.getCacheKey('nigeria_locations')
    try {
      await this.redis.setex(key, ttl, JSON.stringify(locations))
    } catch (error) {
      this.logger.error('Failed to cache location data:', error)
    }
  }

  /**
   * Get cached Nigerian locations
   */
  async getCachedLocationData(): Promise<any[] | null> {
    const key = this.getCacheKey('nigeria_locations')
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached location data:', error)
      return null
    }
  }

  /**
   * Cache user's recent activity for faster dashboard loading
   */
  async cacheUserActivity(
    userId: string,
    activity: any,
    ttl: number = 1800,
  ): Promise<void> {
    const key = this.getCacheKey('activity', userId)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(activity))
    } catch (error) {
      this.logger.error('Failed to cache user activity:', error)
    }
  }

  /**
   * Get cached user activity
   */
  async getCachedUserActivity(userId: string): Promise<any | null> {
    const key = this.getCacheKey('activity', userId)
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached user activity:', error)
      return null
    }
  }

  /**
   * Cache trending items in Nigeria
   */
  async cacheTrendingItems(
    items: any[],
    location?: string,
    ttl: number = 3600,
  ): Promise<void> {
    const key = this.getCacheKey('trending', undefined, location || 'national')
    try {
      await this.redis.setex(key, ttl, JSON.stringify(items))
    } catch (error) {
      this.logger.error('Failed to cache trending items:', error)
    }
  }

  /**
   * Get cached trending items
   */
  async getCachedTrendingItems(location?: string): Promise<any[] | null> {
    const key = this.getCacheKey('trending', undefined, location || 'national')
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached trending items:', error)
      return null
    }
  }

  /**
   * Invalidate cache for specific patterns
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`tbb:ng:*${pattern}*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        this.logger.debug(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`)
      }
    } catch (error) {
      this.logger.error('Failed to invalidate cache pattern:', error)
    }
  }

  /**
   * Invalidate user-specific cache when profile updates
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}`)
  }

  /**
   * Invalidate location-specific cache when new listings added
   */
  async invalidateLocationCache(location: string): Promise<void> {
    await this.invalidatePattern(location)
  }

  /**
   * Set session data for authenticated users
   */
  async setSession(
    sessionId: string,
    data: any,
    ttl: number = 7200, // 2 hours
  ): Promise<void> {
    const key = this.getCacheKey('session', sessionId)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      this.logger.error('Failed to set session:', error)
    }
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<any | null> {
    const key = this.getCacheKey('session', sessionId)
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get session:', error)
      return null
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = this.getCacheKey('session', sessionId)
    try {
      await this.redis.del(key)
    } catch (error) {
      this.logger.error('Failed to delete session:', error)
    }
  }

  /**
   * Rate limiting for Nigerian phone SMS
   */
  async checkSMSRateLimit(
    phoneNumber: string,
    maxAttempts: number = 3,
    windowMinutes: number = 60,
  ): Promise<boolean> {
    const key = this.getCacheKey('sms_rate_limit', phoneNumber)
    try {
      const current = await this.redis.incr(key)
      if (current === 1) {
        await this.redis.expire(key, windowMinutes * 60)
      }
      return current <= maxAttempts
    } catch (error) {
      this.logger.error('Failed to check SMS rate limit:', error)
      return true // Allow on error
    }
  }

  /**
   * Cache API response for expensive operations
   */
  async cacheAPIResponse(
    endpoint: string,
    params: any,
    response: any,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    const key = this.getCacheKey(`api:${endpoint}:${this.hashParams(params)}`)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(response))
    } catch (error) {
      this.logger.error('Failed to cache API response:', error)
    }
  }

  /**
   * Get cached API response
   */
  async getCachedAPIResponse(endpoint: string, params: any): Promise<any | null> {
    const key = this.getCacheKey(`api:${endpoint}:${this.hashParams(params)}`)
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error('Failed to get cached API response:', error)
      return null
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.redis.ping()
      return pong === 'PONG'
    } catch (error) {
      this.logger.error('Redis health check failed:', error)
      return false
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.info('memory')
      const stats = await this.redis.info('stats')
      return {
        memory: this.parseRedisInfo(info),
        stats: this.parseRedisInfo(stats),
        connected: true,
      }
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error)
      return { connected: false, error: error.message }
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache(): Promise<void> {
    try {
      this.logger.log('Starting cache warm-up for Nigerian marketplace...')
      
      // Pre-cache popular Nigerian locations
      const popularLocations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan']
      for (const location of popularLocations) {
        // This would be called by the service layer to pre-populate
        this.logger.debug(`Cache warm-up ready for ${location}`)
      }
      
      this.logger.log('Cache warm-up completed')
    } catch (error) {
      this.logger.error('Cache warm-up failed:', error)
    }
  }

  private generateSearchKey(query: string, filters: any, page: number): string {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|')
    return `${query}:${filterStr}:page${page}`
  }

  private hashParams(params: any): string {
    return Buffer.from(JSON.stringify(params)).toString('base64').slice(0, 32)
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n')
    const result: any = {}
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        result[key] = value
      }
    }
    
    return result
  }

  async onModuleDestroy() {
    await this.redis.quit()
  }
}