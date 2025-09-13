import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadDto } from './upload.dto';

export enum ChunkedUploadStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class InitiateChunkedUploadDto extends UploadDto {
  @ApiProperty({ description: 'Total file size in bytes' })
  @IsNumber()
  @Min(1)
  totalSize: number;

  @ApiProperty({ description: 'Original filename' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Chunk size in bytes (default: 5MB)', default: 5242880 })
  @IsOptional()
  @IsNumber()
  @Min(1048576) // Minimum 1MB
  @Max(104857600) // Maximum 100MB
  chunkSize?: number = 5242880; // 5MB default

  @ApiPropertyOptional({ description: 'Upload timeout in seconds', default: 3600 })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400) // 24 hours max
  timeoutSeconds?: number = 3600; // 1 hour default

  @ApiPropertyOptional({ description: 'File checksum for integrity verification' })
  @IsOptional()
  @IsString()
  checksum?: string;

  @ApiPropertyOptional({ description: 'Resume from existing upload session' })
  @IsOptional()
  @IsString()
  resumeSessionId?: string;
}

export class UploadChunkDto {
  @ApiProperty({ description: 'Upload session ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Chunk number (0-based)' })
  @IsNumber()
  @Min(0)
  chunkNumber: number;

  @ApiProperty({ description: 'Chunk size in bytes' })
  @IsNumber()
  @Min(1)
  chunkSize: number;

  @ApiPropertyOptional({ description: 'Chunk checksum for integrity verification' })
  @IsOptional()
  @IsString()
  chunkChecksum?: string;

  @ApiPropertyOptional({ description: 'Is this the final chunk' })
  @IsOptional()
  @IsBoolean()
  isFinalChunk?: boolean;
}

export class CompleteChunkedUploadDto {
  @ApiProperty({ description: 'Upload session ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Final file checksum for verification' })
  @IsOptional()
  @IsString()
  finalChecksum?: string;

  @ApiPropertyOptional({ description: 'Start processing immediately', default: true })
  @IsOptional()
  @IsBoolean()
  startProcessing?: boolean = true;
}

export class ChunkedUploadSessionDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'File MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'Total file size in bytes' })
  totalSize: number;

  @ApiProperty({ description: 'Chunk size in bytes' })
  chunkSize: number;

  @ApiProperty({ description: 'Total number of chunks' })
  totalChunks: number;

  @ApiProperty({ description: 'Number of uploaded chunks' })
  uploadedChunks: number;

  @ApiProperty({ description: 'Upload progress percentage' })
  progress: number;

  @ApiProperty({ description: 'Session status', enum: ChunkedUploadStatus })
  status: ChunkedUploadStatus;

  @ApiProperty({ description: 'Uploaded chunk numbers' })
  uploadedChunkNumbers: number[];

  @ApiProperty({ description: 'Missing chunk numbers' })
  missingChunkNumbers: number[];

  @ApiPropertyOptional({ description: 'Upload error message' })
  error?: string;

  @ApiProperty({ description: 'Session creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Session update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Session expiry timestamp' })
  expiresAt?: Date;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiPropertyOptional({ description: 'Media ID after completion' })
  mediaId?: string;
}

export class ChunkedUploadResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Upload session', type: ChunkedUploadSessionDto })
  session: ChunkedUploadSessionDto;

  @ApiPropertyOptional({ description: 'Next chunk number to upload' })
  nextChunkNumber?: number;

  @ApiPropertyOptional({ description: 'Upload URL for the next chunk' })
  uploadUrl?: string;

  @ApiPropertyOptional({ description: 'Retry delay in seconds' })
  retryDelay?: number;
}

export class ResumeChunkedUploadDto {
  @ApiProperty({ description: 'Session ID to resume' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Verify chunk integrity before resuming' })
  @IsOptional()
  @IsBoolean()
  verifyIntegrity?: boolean = true;
}

export class CancelChunkedUploadDto {
  @ApiProperty({ description: 'Session ID to cancel' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Cleanup uploaded chunks' })
  @IsOptional()
  @IsBoolean()
  cleanup?: boolean = true;
}