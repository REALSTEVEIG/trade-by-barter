"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const common_1 = require("@nestjs/common");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    configService;
    adapterConstructor;
    logger = new common_1.Logger(RedisIoAdapter.name);
    constructor(app, configService) {
        super(app);
        this.configService = configService;
    }
    async connectToRedis() {
        const redisHost = this.configService.get('REDIS_HOST', 'localhost');
        const redisPort = this.configService.get('REDIS_PORT', 6379);
        const redisPassword = this.configService.get('REDIS_PASSWORD');
        try {
            const pubClient = (0, redis_1.createClient)({
                socket: {
                    host: redisHost,
                    port: redisPort,
                },
                password: redisPassword,
            });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient, {
                key: 'tradebybarter:socket.io',
                requestsTimeout: 10000,
            });
            this.logger.log(`Redis adapter connected to ${redisHost}:${redisPort}`);
            pubClient.on('error', (err) => {
                this.logger.error('Redis Pub Client Error:', err);
            });
            subClient.on('error', (err) => {
                this.logger.error('Redis Sub Client Error:', err);
            });
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            this.logger.warn('Falling back to in-memory adapter');
        }
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
            this.logger.log('Socket.IO using Redis adapter for clustering');
        }
        else {
            this.logger.warn('Socket.IO using in-memory adapter (not recommended for production)');
        }
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis.adapter.js.map