import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads/listings';
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  constructor(private readonly prisma: PrismaService) {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const name = uuidv4();
    return `${name}${ext}`;
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size cannot exceed 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }
  }

  async uploadListingImages(
    listingId: string,
    userId: string,
    files: Express.Multer.File[]
  ): Promise<{ message: string; urls: string[] }> {
    // Verify listing ownership
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, isActive: true },
    });

    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only upload images to your own listings');
    }

    // Check existing image count
    const existingImageCount = await this.prisma.media.count({
      where: { listingId },
    });

    if (existingImageCount + files.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed per listing');
    }

    // Validate files
    files.forEach(file => this.validateFile(file));

    const uploadedUrls: string[] = [];
    const mediaRecords: any[] = [];

    try {
      // Process each file
      for (const file of files) {
        const fileName = this.generateFileName(file.originalname);
        const filePath = path.join(this.uploadDir, fileName);
        const publicUrl = `${this.baseUrl}/${this.uploadDir}/${fileName}`;

        // Save file to disk
        await fs.writeFile(filePath, file.buffer);

        uploadedUrls.push(publicUrl);
        mediaRecords.push({
          filename: fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: publicUrl,
          listingId,
        });
      }

      // Save media records to database
      await this.prisma.media.createMany({
        data: mediaRecords,
      });

      return {
        message: `${files.length} image(s) uploaded successfully`,
        urls: uploadedUrls,
      };
    } catch (error) {
      // Clean up uploaded files if database operation fails
      for (const url of uploadedUrls) {
        const fileName = path.basename(url);
        const filePath = path.join(this.uploadDir, fileName);
        try {
          await fs.unlink(filePath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  async deleteListingImage(
    listingId: string,
    imageId: string,
    userId: string
  ): Promise<{ message: string }> {
    // Verify listing ownership
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, isActive: true },
    });

    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only delete images from your own listings');
    }

    // Get media record
    const media = await this.prisma.media.findUnique({
      where: { id: imageId, listingId },
    });

    if (!media) {
      throw new NotFoundException('Image not found');
    }

    try {
      // Delete file from disk
      const fileName = path.basename(media.url);
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    } catch {
      // Continue even if file deletion fails
    }

    // Delete media record from database
    await this.prisma.media.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }

  async getListingImages(listingId: string): Promise<string[]> {
    const media = await this.prisma.media.findMany({
      where: { listingId },
      select: { url: true },
      orderBy: { uploadedAt: 'asc' },
    });

    return media.map(m => m.url);
  }
}