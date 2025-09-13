import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './chat/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Serve static files (uploaded images)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global prefix for all routes
  app.setGlobalPrefix(configService.get<string>('API_PREFIX', 'api/v1'));

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      disableErrorMessages: configService.get<string>('NODE_ENV') === 'production',
      stopAtFirstError: true,
    }),
  );

  // Swagger documentation setup
  if (configService.get<boolean>('SWAGGER_ENABLED', true)) {
    const config = new DocumentBuilder()
      .setTitle('TradeByBarter API')
      .setDescription('Nigerian Barter Marketplace API - Complete CRUD and Search Functionality')
      .setVersion('1.0')
      .setContact(
        'TradeByBarter Team',
        'https://tradebybarter.com',
        'support@tradebybarter.com',
      )
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
      .addServer(`http://localhost:${configService.get<number>('PORT', 3000)}`, 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`Swagger documentation available at: http://localhost:${configService.get<number>('PORT', 3000)}/api/docs`);
  }

  // Initialize Redis adapter for Socket.IO if Redis is configured
  if (configService.get<string>('REDIS_HOST')) {
    try {
      const redisIoAdapter = new RedisIoAdapter(app, configService);
      await redisIoAdapter.connectToRedis();
      app.useWebSocketAdapter(redisIoAdapter);
      console.log('Redis Socket.IO adapter configured for horizontal scaling');
    } catch (error) {
      console.warn('Failed to initialize Redis Socket.IO adapter, using in-memory adapter:', error.message);
    }
  } else {
    console.log('Redis not configured, using in-memory Socket.IO adapter');
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`TradeByBarter API is running on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
  console.log(`Database: ${configService.get<string>('DATABASE_URL')?.split('@')[1] || 'Connected'}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
