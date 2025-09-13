import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatCacheService } from './cache.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: './uploads/chat',
          filename: (req, file, callback) => {
            // Generate unique filename with timestamp and random string
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
            callback(null, filename);
          },
        }),
        limits: {
          fileSize: 50 * 1024 * 1024, // 50MB limit for chat media
        },
        fileFilter: (req, file, callback) => {
          // Allow images, documents, audio, and video files
          const allowedMimes = [
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            // Audio
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/m4a',
            // Video (limited support for voice messages)
            'video/mp4',
            'video/webm',
          ];

          if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error(`File type ${file.mimetype} not supported for chat messages`), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatCacheService],
  exports: [ChatService, ChatGateway, ChatCacheService], // Export for use in other modules
})
export class ChatModule {}