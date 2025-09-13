import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaEntityType {
  USER = 'USER',
  LISTING = 'LISTING',
  CHAT = 'CHAT',
  MESSAGE = 'MESSAGE',
  OFFER = 'OFFER',
  VERIFICATION = 'VERIFICATION',
}

export enum MediaCategory {
  AVATAR = 'AVATAR',
  LISTING_IMAGE = 'LISTING_IMAGE',
  CHAT_MEDIA = 'CHAT_MEDIA',
  DOCUMENT = 'DOCUMENT',
  VERIFICATION = 'VERIFICATION',
  GENERAL = 'GENERAL',
}

export enum QualityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  ORIGINAL = 'ORIGINAL',
}

export enum CompressionLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  MAXIMUM = 'MAXIMUM',
}

export class ResizeOptionsDto {
  @ApiPropertyOptional({ description: 'Target width in pixels' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: 'Target height in pixels' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: 'Quality level (1-100)', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  quality?: number;

  @ApiPropertyOptional({ description: 'Fit strategy for resizing' })
  @IsOptional()
  @IsString()
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class UploadDto {
  @ApiProperty({ description: 'Entity type this media belongs to' })
  @IsEnum(MediaEntityType)
  entityType: MediaEntityType;

  @ApiPropertyOptional({ description: 'Entity ID this media belongs to' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ description: 'Media category' })
  @IsEnum(MediaCategory)
  category: MediaCategory;

  @ApiPropertyOptional({ description: 'Quality level for processing' })
  @IsOptional()
  @IsEnum(QualityLevel)
  quality?: QualityLevel;

  @ApiPropertyOptional({ description: 'Compression level' })
  @IsOptional()
  @IsEnum(CompressionLevel)
  compressionLevel?: CompressionLevel;

  @ApiPropertyOptional({ description: 'Resize options', type: ResizeOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResizeOptionsDto)
  resize?: ResizeOptionsDto;

  @ApiPropertyOptional({ description: 'Upload region for geographic optimization' })
  @IsOptional()
  @IsString()
  uploadRegion?: string;

  @ApiPropertyOptional({ description: 'Optimize for Nigerian bandwidth conditions', default: true })
  @IsOptional()
  @IsBoolean()
  bandwidthOptimized?: boolean = true;

  @ApiPropertyOptional({ description: 'Process immediately or queue for later', default: true })
  @IsOptional()
  @IsBoolean()
  processImmediately?: boolean = true;

  @ApiPropertyOptional({ description: 'Generate thumbnails automatically', default: true })
  @IsOptional()
  @IsBoolean()
  generateThumbnails?: boolean = true;

  @ApiPropertyOptional({ description: 'File expiry time in hours' })
  @IsOptional()
  @IsNumber()
  expiryHours?: number;

  @ApiPropertyOptional({ description: 'Custom metadata tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class MultipleUploadDto extends UploadDto {
  @ApiPropertyOptional({ description: 'Maximum number of files to process', default: 10 })
  @IsOptional()
  @IsNumber()
  maxFiles?: number = 10;

  @ApiPropertyOptional({ description: 'Maintain upload order', default: true })
  @IsOptional()
  @IsBoolean()
  maintainOrder?: boolean = true;
}

export class SingleUploadDto extends UploadDto {
  @ApiPropertyOptional({ description: 'Replace existing file if entityId matches' })
  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;
}