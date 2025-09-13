import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageProviderFactory } from '../storage/storage-provider.factory';
import {
  UploadDto,
  SingleUploadDto,
  MultipleUploadDto
} from '../dto/upload.dto';
import {
  MediaResponseDto,
  MediaListResponseDto,
  MediaUploadResponseDto
} from '../dto/media-response.dto';
import * as crypto from 'crypto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly storageFactory: StorageProviderFactory,
  ) {}

  private generateStorageKey(userId: string, filename: string, category: string): string {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    
    return `${category.toLowerCase()}/${userId}/${timestamp}-${randomSuffix}-${baseName}${ext}`;
  }

  private generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private extractMetadata(buffer: Buffer, mimeType: string): Record<string, any> {
    const metadata: Record<string, any> = {
      size: buffer.length,
      format: mimeType.split('/')[1],
    };

    // Basic metadata extraction (would be enhanced with Sharp/FFmpeg in real implementation)
    if (mimeType.startsWith('image/')) {
      // Mock image metadata
      metadata.width = 1920;
      metadata.height = 1080;
      metadata.colorSpace = 'sRGB';
    } else if (mimeType.startsWith('video/')) {
      // Mock video metadata
      metadata.width = 1920;
      metadata.height = 1080;
      metadata.duration = 120; // seconds
      metadata.framerate = 30;
      metadata.bitrate = '2000k';
    } else if (mimeType.startsWith('audio/')) {
      // Mock audio metadata
      metadata.duration = 180; // seconds
      metadata.bitrate = '128k';
      metadata.sampleRate = 44100;
      metadata.channels = 2;
    }

    return metadata;
  }

  private mapToResponseDto(media: any): MediaResponseDto {
    return {
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      category: media.category,
      entityType: media.entityType,
      entityId: media.entityId,
      status: media.status,
      processingJobId: media.processingJobId,
      processingError: media.processingError,
      metadata: media.metadata,
      storageProvider: media.storageProvider,
      storageKey: media.storageKey,
      storageRegion: media.storageRegion,
      variants: media.variants || [],
      checksum: media.checksum,
      isSecure: media.isSecure,
      moderationStatus: media.moderationStatus,
      moderationFlags: media.moderationFlags,
      accessCount: media.accessCount,
      lastAccessedAt: media.lastAccessedAt,
      expiresAt: media.expiresAt,
      isOrphan: media.isOrphan,
      uploadRegion: media.uploadRegion,
      compressionLevel: media.compressionLevel,
      bandwidthOptimized: media.bandwidthOptimized,
      uploadedAt: media.uploadedAt,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      userId: media.userId,
    };
  }

  async uploadSingle(
    userId: string,
    file: Express.Multer.File,
    uploadDto: SingleUploadDto,
  ): Promise<MediaResponseDto> {
    try {
      this.logger.log(`Single upload started: ${file.originalname} by user ${userId}`);

      // Validate file
      this.validateFile(file);

      // Check user storage quota
      await this.checkStorageQuota(userId, file.size);

      // Generate storage key
      const storageKey = this.generateStorageKey(userId, file.originalname, uploadDto.category);

      // Get appropriate storage provider
      const provider = this.storageFactory.getProviderForFileType(file.mimetype, uploadDto.category);

      // Upload to storage
      const uploadResult = await provider.upload(file.buffer, storageKey, {
        contentType: file.mimetype,
        metadata: {
          userId,
          category: uploadDto.category,
          originalName: file.originalname,
        },
      });

      // Extract metadata
      const metadata = this.extractMetadata(file.buffer, file.mimetype);

      // Calculate expiry
      const expiresAt = uploadDto.expiryHours 
        ? new Date(Date.now() + uploadDto.expiryHours * 60 * 60 * 1000)
        : null;

      // Create media record
      const media = await this.prisma.media.create({
        data: {
          filename: path.basename(storageKey),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: uploadResult.url,
          category: uploadDto.category,
          entityType: uploadDto.entityType,
          entityId: uploadDto.entityId,
          status: 'READY',
          metadata,
          storageProvider: 'LOCAL', // This would be dynamic based on provider
          storageKey,
          storageRegion: uploadDto.uploadRegion,
          checksum: this.generateChecksum(file.buffer),
          isSecure: true,
          moderationStatus: 'PENDING',
          moderationFlags: [],
          uploadRegion: uploadDto.uploadRegion,
          compressionLevel: uploadDto.compressionLevel || 'MEDIUM',
          bandwidthOptimized: uploadDto.bandwidthOptimized || true,
          expiresAt,
          userId,
        },
        include: {
          variants: true,
        },
      });

      // Update user storage quota
      await this.updateStorageQuota(userId, file.size);

      this.logger.log(`Single upload completed: ${media.id}`);
      return this.mapToResponseDto(media);
    } catch (error) {
      this.logger.error(`Single upload failed: ${file.originalname}`, error.stack);
      throw error;
    }
  }

  async uploadMultiple(
    userId: string,
    files: Express.Multer.File[],
    uploadDto: MultipleUploadDto,
  ): Promise<MediaUploadResponseDto> {
    this.logger.log(`Multiple upload started: ${files.length} files by user ${userId}`);

    const results: MediaResponseDto[] = [];
    const failed: Array<{ filename: string; error: string }> = [];
    let totalSize = 0;

    // Validate total size first
    for (const file of files) {
      totalSize += file.size;
    }
    await this.checkStorageQuota(userId, totalSize);

    // Process files
    for (const file of files) {
      try {
        const singleDto: SingleUploadDto = {
          ...uploadDto,
          replaceExisting: false,
        };
        
        const result = await this.uploadSingle(userId, file, singleDto);
        results.push(result);
      } catch (error) {
        failed.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    this.logger.log(`Multiple upload completed: ${results.length} successful, ${failed.length} failed`);

    return {
      message: `Upload completed: ${results.length} successful, ${failed.length} failed`,
      media: results,
      failed,
      uploadedCount: results.length,
      failedCount: failed.length,
      processingJobs: [], // Would be populated with actual job IDs
    };
  }

  async getMedia(id: string, userId?: string): Promise<MediaResponseDto> {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check access permissions
    if (userId && media.userId !== userId) {
      // Check if media is public or user has access
      if (media.moderationStatus !== 'APPROVED' || !media.isSecure) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Update access count
    await this.prisma.media.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return this.mapToResponseDto(media);
  }

  async getUserMedia(
    userId: string,
    page = 1,
    limit = 20,
    category?: string,
    status?: string,
  ): Promise<MediaListResponseDto> {
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    if (category) where.category = category;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map(item => this.mapToResponseDto(item)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async deleteMedia(id: string, userId: string): Promise<{ message: string }> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.userId !== userId) {
      throw new ForbiddenException('You can only delete your own media');
    }

    try {
      // Delete from storage
      const provider = this.storageFactory.getProvider(media.storageProvider.toLowerCase());
      await provider.delete(media.storageKey);

      // Delete variants from storage
      const variants = await this.prisma.mediaVariant.findMany({
        where: { mediaId: id },
      });

      for (const variant of variants) {
        await provider.delete(variant.storageKey);
      }

      // Delete from database
      await this.prisma.media.delete({ where: { id } });

      // Update user storage quota
      await this.updateStorageQuota(userId, -media.size);

      this.logger.log(`Media deleted: ${id}`);
      return { message: 'Media deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete media: ${id}`, error.stack);
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size limits
    const maxSize = this.configService.get<number>('MEDIA_MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Check allowed MIME types
    const allowedTypes = this.configService.get<string[]>('MEDIA_ALLOWED_TYPES', [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
    ]);

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    // Basic file validation (magic number checking would be done here)
    if (file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  private async checkStorageQuota(userId: string, additionalSize: number): Promise<void> {
    let quota = await this.prisma.userStorageQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      // Create default quota
      quota = await this.prisma.userStorageQuota.create({
        data: {
          userId,
          totalQuota: BigInt(100 * 1024 * 1024), // 100MB default
          usedStorage: BigInt(0),
          mediaCount: 0,
        },
      });
    }

    const newUsage = Number(quota.usedStorage) + additionalSize;
    
    if (newUsage > Number(quota.totalQuota)) {
      throw new BadRequestException('Storage quota exceeded');
    }
  }

  private async updateStorageQuota(userId: string, sizeChange: number): Promise<void> {
    await this.prisma.userStorageQuota.update({
      where: { userId },
      data: {
        usedStorage: { increment: BigInt(sizeChange) },
        mediaCount: sizeChange > 0 ? { increment: 1 } : { decrement: 1 },
        lastCalculatedAt: new Date(),
      },
    });
  }

  async getStorageStats(userId: string): Promise<{
    totalQuota: number;
    usedStorage: number;
    availableStorage: number;
    usagePercentage: number;
    mediaCount: number;
  }> {
    const quota = await this.prisma.userStorageQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      return {
        totalQuota: 100 * 1024 * 1024, // 100MB
        usedStorage: 0,
        availableStorage: 100 * 1024 * 1024,
        usagePercentage: 0,
        mediaCount: 0,
      };
    }

    const totalQuota = Number(quota.totalQuota);
    const usedStorage = Number(quota.usedStorage);
    const availableStorage = totalQuota - usedStorage;
    const usagePercentage = (usedStorage / totalQuota) * 100;

    return {
      totalQuota,
      usedStorage,
      availableStorage,
      usagePercentage,
      mediaCount: quota.mediaCount,
    };
  }

  async cleanupExpiredMedia(): Promise<{ deletedCount: number }> {
    const expiredMedia = await this.prisma.media.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    let deletedCount = 0;

    for (const media of expiredMedia) {
      try {
        const provider = this.storageFactory.getProvider(media.storageProvider.toLowerCase());
        await provider.delete(media.storageKey);
        
        await this.prisma.media.delete({ where: { id: media.id } });
        
        // Update user storage quota
        await this.updateStorageQuota(media.userId, -media.size);
        
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to cleanup expired media: ${media.id}`, error.stack);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} expired media files`);
    return { deletedCount };
  }

  async cleanupOrphanedMedia(): Promise<{ deletedCount: number }> {
    // Find orphaned media (not linked to any entity)
    const orphanedMedia = await this.prisma.media.findMany({
      where: {
        isOrphan: true,
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
        },
      },
    });

    let deletedCount = 0;

    for (const media of orphanedMedia) {
      try {
        const provider = this.storageFactory.getProvider(media.storageProvider.toLowerCase());
        await provider.delete(media.storageKey);
        
        await this.prisma.media.delete({ where: { id: media.id } });
        
        // Update user storage quota
        await this.updateStorageQuota(media.userId, -media.size);
        
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to cleanup orphaned media: ${media.id}`, error.stack);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} orphaned media files`);
    return { deletedCount };
  }
}