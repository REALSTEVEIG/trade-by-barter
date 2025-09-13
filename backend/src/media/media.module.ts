import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../prisma/prisma.module';
import { MediaController } from './media.controller';
import { MediaService } from './services/media.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { S3StorageProvider } from './storage/s3-storage.provider';
import { StorageProviderFactory } from './storage/storage-provider.factory';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MulterModule.register({
      dest: './uploads/temp',
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 10,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    LocalStorageProvider,
    S3StorageProvider,
    StorageProviderFactory,
  ],
  exports: [
    MediaService,
    StorageProviderFactory,
    LocalStorageProvider,
    S3StorageProvider,
  ],
})
export class MediaModule {}