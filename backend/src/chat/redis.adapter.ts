import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  constructor(
    app: any,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      // Create Redis clients for pub/sub
      const pubClient = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
        },
        password: redisPassword,
      });

      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient, {
        key: 'tradebybarter:socket.io',
        requestsTimeout: 10000,
      });

      this.logger.log(`Redis adapter connected to ${redisHost}:${redisPort}`);

      // Handle Redis connection errors
      pubClient.on('error', (err) => {
        this.logger.error('Redis Pub Client Error:', err);
      });

      subClient.on('error', (err) => {
        this.logger.error('Redis Sub Client Error:', err);
      });

    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      this.logger.warn('Falling back to in-memory adapter');
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      this.logger.log('Socket.IO using Redis adapter for clustering');
    } else {
      this.logger.warn('Socket.IO using in-memory adapter (not recommended for production)');
    }

    return server;
  }
}