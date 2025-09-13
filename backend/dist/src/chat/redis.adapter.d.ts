import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
export declare class RedisIoAdapter extends IoAdapter {
    private readonly configService;
    private adapterConstructor;
    private readonly logger;
    constructor(app: any, configService: ConfigService);
    connectToRedis(): Promise<void>;
    createIOServer(port: number, options?: ServerOptions): any;
}
