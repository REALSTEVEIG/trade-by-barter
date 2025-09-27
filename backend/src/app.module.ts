import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { OffersModule } from './offers/offers.module';
import { PaymentsModule } from './payments/payments.module';
import { EscrowModule } from './escrow/escrow.module';
import { WalletModule } from './wallet/wallet.module';
import { ChatModule } from './chat/chat.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { LocationsModule } from './locations/locations.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration module to load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute
      },
      {
        name: 'medium',
        ttl: 600000, // 10 minutes
        limit: 100, // 100 requests per 10 minutes
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 500, // 500 requests per hour
      },
    ]),
    
    // Database module
    PrismaModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    ListingsModule,
    OffersModule,
    PaymentsModule,
    EscrowModule,
    WalletModule,
    ChatModule,
    MediaModule,
    AdminModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    
    // Global validation pipe with enhanced options
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        whitelist: true, // Remove properties that are not in the DTO
        forbidNonWhitelisted: true, // Throw error for extra properties
        transform: true, // Transform input to DTO instances
        transformOptions: {
          enableImplicitConversion: true, // Allow automatic type conversion
        },
        validateCustomDecorators: true, // Enable custom validation decorators
        errorHttpStatusCode: 422, // Unprocessable Entity for validation errors
        exceptionFactory: (errors) => {
          // Custom error format for validation errors
          const errorMessages = errors.map(error => ({
            field: error.property,
            value: error.value,
            constraints: Object.values(error.constraints || {}),
          }));
          
          return {
            message: 'Validation failed',
            details: {
              errors: errorMessages,
              suggestion: 'Please check your request data and fix the validation errors',
            },
            statusCode: 422,
          };
        },
      }),
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
