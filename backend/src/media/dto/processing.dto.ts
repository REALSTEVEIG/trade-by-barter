import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProcessingJobType {
  RESIZE = 'RESIZE',
  COMPRESS = 'COMPRESS',
  CONVERT = 'CONVERT',
  THUMBNAIL = 'THUMBNAIL',
  WATERMARK = 'WATERMARK',
  METADATA_EXTRACT = 'METADATA_EXTRACT',
  VIRUS_SCAN = 'VIRUS_SCAN',
  CONTENT_MODERATION = 'CONTENT_MODERATION',
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum JobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class ProcessMediaDto {
  @ApiProperty({ description: 'Media ID to process' })
  @IsString()
  mediaId: string;

  @ApiProperty({ description: 'Processing job type', enum: ProcessingJobType })
  @IsEnum(ProcessingJobType)
  type: ProcessingJobType;

  @ApiProperty({ description: 'Job priority', enum: JobPriority })
  @IsEnum(JobPriority)
  priority: JobPriority;

  @ApiPropertyOptional({ description: 'Processing options' })
  @IsOptional()
  options?: Record<string, any>;
}

export class ProcessingJobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Media ID' })
  mediaId: string;

  @ApiProperty({ description: 'Job type', enum: ProcessingJobType })
  type: ProcessingJobType;

  @ApiProperty({ description: 'Job status', enum: JobStatus })
  status: JobStatus;

  @ApiProperty({ description: 'Job priority', enum: JobPriority })
  priority: JobPriority;

  @ApiProperty({ description: 'Processing options' })
  options: Record<string, any>;

  @ApiProperty({ description: 'Job progress (0-100)' })
  progress: number;

  @ApiPropertyOptional({ description: 'Job start timestamp' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Job completion timestamp' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Job failure timestamp' })
  failedAt?: Date;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Maximum retries allowed' })
  maxRetries: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;

  @ApiProperty({ description: 'Queue name' })
  queueName: string;

  @ApiPropertyOptional({ description: 'Queue job ID' })
  jobId?: string;

  @ApiProperty({ description: 'Job creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Job update timestamp' })
  updatedAt: Date;
}

export class BatchProcessingDto {
  @ApiProperty({ description: 'Media IDs to process' })
  @IsArray()
  @IsString({ each: true })
  mediaIds: string[];

  @ApiProperty({ description: 'Processing job type', enum: ProcessingJobType })
  @IsEnum(ProcessingJobType)
  type: ProcessingJobType;

  @ApiProperty({ description: 'Job priority', enum: JobPriority })
  @IsEnum(JobPriority)
  priority: JobPriority;

  @ApiPropertyOptional({ description: 'Processing options' })
  @IsOptional()
  options?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Process sequentially', default: false })
  @IsOptional()
  @IsBoolean()
  sequential?: boolean = false;
}

export class BatchProcessingResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Created processing jobs', type: [ProcessingJobResponseDto] })
  jobs: ProcessingJobResponseDto[];

  @ApiProperty({ description: 'Successfully queued count' })
  successCount: number;

  @ApiProperty({ description: 'Failed to queue count' })
  failedCount: number;

  @ApiProperty({ description: 'Failed media IDs with errors' })
  failures: Array<{
    mediaId: string;
    error: string;
  }>;
}

export class ProcessingStatsDto {
  @ApiProperty({ description: 'Total jobs count' })
  totalJobs: number;

  @ApiProperty({ description: 'Pending jobs count' })
  pendingJobs: number;

  @ApiProperty({ description: 'Processing jobs count' })
  processingJobs: number;

  @ApiProperty({ description: 'Completed jobs count' })
  completedJobs: number;

  @ApiProperty({ description: 'Failed jobs count' })
  failedJobs: number;

  @ApiProperty({ description: 'Average processing time in seconds' })
  avgProcessingTime: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Jobs by type' })
  jobsByType: Record<ProcessingJobType, number>;

  @ApiProperty({ description: 'Jobs by priority' })
  jobsByPriority: Record<JobPriority, number>;

  @ApiProperty({ description: 'Current queue size' })
  queueSize: number;

  @ApiProperty({ description: 'Active workers count' })
  activeWorkers: number;
}