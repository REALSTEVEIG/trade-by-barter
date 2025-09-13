"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const redis_adapter_1 = require("./chat/redis.adapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));
    const corsOrigins = configService.get('CORS_ORIGIN', 'http://localhost:5173').split(',');
    app.enableCors({
        origin: corsOrigins,
        credentials: configService.get('CORS_CREDENTIALS', true),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: configService.get('NODE_ENV') === 'production',
        stopAtFirstError: true,
    }));
    if (configService.get('SWAGGER_ENABLED', true)) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('TradeByBarter API')
            .setDescription('Nigerian Barter Marketplace API - Complete CRUD and Search Functionality')
            .setVersion('1.0')
            .setContact('TradeByBarter Team', 'https://tradebybarter.com', 'support@tradebybarter.com')
            .setLicense('MIT', 'https://opensource.org/licenses/MIT')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        })
            .addTag('Authentication', 'User authentication endpoints')
            .addTag('Users', 'User management endpoints')
            .addTag('Listings', 'Marketplace listings CRUD and search endpoints')
            .addServer(`http://localhost:${configService.get('PORT', 3000)}`, 'Development server')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        });
        console.log(`Swagger documentation available at: http://localhost:${configService.get('PORT', 3000)}/api/docs`);
    }
    if (configService.get('REDIS_HOST')) {
        try {
            const redisIoAdapter = new redis_adapter_1.RedisIoAdapter(app, configService);
            await redisIoAdapter.connectToRedis();
            app.useWebSocketAdapter(redisIoAdapter);
            console.log('Redis Socket.IO adapter configured for horizontal scaling');
        }
        catch (error) {
            console.warn('Failed to initialize Redis Socket.IO adapter, using in-memory adapter:', error.message);
        }
    }
    else {
        console.log('Redis not configured, using in-memory Socket.IO adapter');
    }
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`TradeByBarter API is running on: http://localhost:${port}`);
    console.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
    console.log(`Database: ${configService.get('DATABASE_URL')?.split('@')[1] || 'Connected'}`);
}
bootstrap().catch((error) => {
    console.error('Failed to start the application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map