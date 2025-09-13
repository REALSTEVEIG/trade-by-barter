import { IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AnalyticsTimeframe {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export class GetAnalyticsDto {
  @ApiPropertyOptional({ description: 'Start date for analytics', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Analytics timeframe', enum: AnalyticsTimeframe })
  @IsOptional()
  @IsEnum(AnalyticsTimeframe)
  timeframe?: AnalyticsTimeframe = AnalyticsTimeframe.DAY;

  @ApiPropertyOptional({ description: 'Media type filter', enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({ description: 'Storage provider filter' })
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'Region filter' })
  @IsOptional()
  region?: string;
}

export class AnalyticsDataPointDto {
  @ApiProperty({ description: 'Date for this data point' })
  date: Date;

  @ApiProperty({ description: 'Total uploads' })
  totalUploads: number;

  @ApiProperty({ description: 'Successful uploads' })
  successfulUploads: number;

  @ApiProperty({ description: 'Failed uploads' })
  failedUploads: number;

  @ApiProperty({ description: 'Total storage used in bytes' })
  totalStorageUsed: number;

  @ApiProperty({ description: 'Storage usage by provider' })
  storageByProvider: Record<string, number>;

  @ApiProperty({ description: 'Storage usage by region' })
  storageByRegion: Record<string, number>;

  @ApiProperty({ description: 'Total processing jobs' })
  totalProcessingJobs: number;

  @ApiProperty({ description: 'Successful processing jobs' })
  successfulJobs: number;

  @ApiProperty({ description: 'Failed processing jobs' })
  failedJobs: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  avgProcessingTime: number;

  @ApiProperty({ description: 'Image uploads count' })
  imageUploads: number;

  @ApiProperty({ description: 'Video uploads count' })
  videoUploads: number;

  @ApiProperty({ description: 'Audio uploads count' })
  audioUploads: number;

  @ApiProperty({ description: 'Document uploads count' })
  documentUploads: number;

  @ApiProperty({ description: 'Lagos region uploads' })
  lagosUploads: number;

  @ApiProperty({ description: 'Abuja region uploads' })
  abujaUploads: number;

  @ApiProperty({ description: 'Port Harcourt region uploads' })
  portHarcourtUploads: number;

  @ApiProperty({ description: 'Other regions uploads' })
  otherRegionUploads: number;
}

export class MediaAnalyticsResponseDto {
  @ApiProperty({ description: 'Analytics summary' })
  summary: {
    totalFiles: number;
    totalSize: number;
    totalUsers: number;
    averageFileSize: number;
    popularFileTypes: Array<{ type: string; count: number; percentage: number }>;
    topRegions: Array<{ region: string; count: number; percentage: number }>;
    storageDistribution: Array<{ provider: string; size: number; percentage: number }>;
  };

  @ApiProperty({ description: 'Time series data', type: [AnalyticsDataPointDto] })
  timeSeries: AnalyticsDataPointDto[];

  @ApiProperty({ description: 'Upload trends' })
  uploadTrends: {
    growth: number; // percentage
    trend: 'UP' | 'DOWN' | 'STABLE';
    peakDay: string;
    peakHour: number;
    averageDaily: number;
    averageWeekly: number;
    averageMonthly: number;
  };

  @ApiProperty({ description: 'Processing performance' })
  processingPerformance: {
    averageTime: number;
    successRate: number;
    bottlenecks: string[];
    recommendations: string[];
  };

  @ApiProperty({ description: 'Storage insights' })
  storageInsights: {
    totalUsed: number;
    totalAvailable: number;
    utilizationRate: number;
    costAnalysis: {
      totalCost: number;
      costByProvider: Record<string, number>;
      projectedMonthlyCost: number;
    };
    cleanupOpportunities: {
      orphanedFiles: number;
      expiredFiles: number;
      duplicateFiles: number;
      potentialSavings: number;
    };
  };

  @ApiProperty({ description: 'Nigerian network optimization insights' })
  nigerianOptimization: {
    bandwidthSavings: number;
    compressionEfficiency: number;
    regionalPerformance: Record<string, {
      averageUploadTime: number;
      successRate: number;
      preferredQuality: string;
    }>;
    recommendations: string[];
  };
}

export class UserStorageAnalyticsDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Total storage used in bytes' })
  totalUsed: number;

  @ApiProperty({ description: 'Storage quota in bytes' })
  quota: number;

  @ApiProperty({ description: 'Usage percentage' })
  usagePercentage: number;

  @ApiProperty({ description: 'File count by type' })
  filesByType: Record<MediaType, number>;

  @ApiProperty({ description: 'Storage by category' })
  storageByCategory: {
    images: number;
    videos: number;
    audio: number;
    documents: number;
  };

  @ApiProperty({ description: 'Upload activity' })
  uploadActivity: {
    last7Days: number;
    last30Days: number;
    totalFiles: number;
    firstUpload: Date;
    lastUpload: Date;
  };

  @ApiProperty({ description: 'Quality preferences' })
  qualityPreferences: Record<string, number>;

  @ApiProperty({ description: 'Regional activity' })
  regionalActivity: Record<string, number>;
}

export class SystemHealthDto {
  @ApiProperty({ description: 'Overall system health score (0-100)' })
  healthScore: number;

  @ApiProperty({ description: 'Storage health' })
  storage: {
    available: number;
    used: number;
    healthy: boolean;
    issues: string[];
  };

  @ApiProperty({ description: 'Processing queue health' })
  processing: {
    queueSize: number;
    averageWaitTime: number;
    workerUtilization: number;
    healthy: boolean;
    issues: string[];
  };

  @ApiProperty({ description: 'API performance' })
  api: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    healthy: boolean;
    issues: string[];
  };

  @ApiProperty({ description: 'Database performance' })
  database: {
    connectionPool: number;
    averageQueryTime: number;
    healthy: boolean;
    issues: string[];
  };

  @ApiProperty({ description: 'Regional performance by Nigerian cities' })
  regionalHealth: Record<string, {
    healthy: boolean;
    averageUploadTime: number;
    successRate: number;
    issues: string[];
  }>;

  @ApiProperty({ description: 'Recommendations for improvement' })
  recommendations: Array<{
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    action: string;
  }>;
}