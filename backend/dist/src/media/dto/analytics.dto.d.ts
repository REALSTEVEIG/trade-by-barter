export declare enum AnalyticsTimeframe {
    HOUR = "HOUR",
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR"
}
export declare enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT"
}
export declare class GetAnalyticsDto {
    startDate?: string;
    endDate?: string;
    timeframe?: AnalyticsTimeframe;
    mediaType?: MediaType;
    provider?: string;
    region?: string;
}
export declare class AnalyticsDataPointDto {
    date: Date;
    totalUploads: number;
    successfulUploads: number;
    failedUploads: number;
    totalStorageUsed: number;
    storageByProvider: Record<string, number>;
    storageByRegion: Record<string, number>;
    totalProcessingJobs: number;
    successfulJobs: number;
    failedJobs: number;
    avgProcessingTime: number;
    imageUploads: number;
    videoUploads: number;
    audioUploads: number;
    documentUploads: number;
    lagosUploads: number;
    abujaUploads: number;
    portHarcourtUploads: number;
    otherRegionUploads: number;
}
export declare class MediaAnalyticsResponseDto {
    summary: {
        totalFiles: number;
        totalSize: number;
        totalUsers: number;
        averageFileSize: number;
        popularFileTypes: Array<{
            type: string;
            count: number;
            percentage: number;
        }>;
        topRegions: Array<{
            region: string;
            count: number;
            percentage: number;
        }>;
        storageDistribution: Array<{
            provider: string;
            size: number;
            percentage: number;
        }>;
    };
    timeSeries: AnalyticsDataPointDto[];
    uploadTrends: {
        growth: number;
        trend: 'UP' | 'DOWN' | 'STABLE';
        peakDay: string;
        peakHour: number;
        averageDaily: number;
        averageWeekly: number;
        averageMonthly: number;
    };
    processingPerformance: {
        averageTime: number;
        successRate: number;
        bottlenecks: string[];
        recommendations: string[];
    };
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
export declare class UserStorageAnalyticsDto {
    userId: string;
    totalUsed: number;
    quota: number;
    usagePercentage: number;
    filesByType: Record<MediaType, number>;
    storageByCategory: {
        images: number;
        videos: number;
        audio: number;
        documents: number;
    };
    uploadActivity: {
        last7Days: number;
        last30Days: number;
        totalFiles: number;
        firstUpload: Date;
        lastUpload: Date;
    };
    qualityPreferences: Record<string, number>;
    regionalActivity: Record<string, number>;
}
export declare class SystemHealthDto {
    healthScore: number;
    storage: {
        available: number;
        used: number;
        healthy: boolean;
        issues: string[];
    };
    processing: {
        queueSize: number;
        averageWaitTime: number;
        workerUtilization: number;
        healthy: boolean;
        issues: string[];
    };
    api: {
        averageResponseTime: number;
        errorRate: number;
        throughput: number;
        healthy: boolean;
        issues: string[];
    };
    database: {
        connectionPool: number;
        averageQueryTime: number;
        healthy: boolean;
        issues: string[];
    };
    regionalHealth: Record<string, {
        healthy: boolean;
        averageUploadTime: number;
        successRate: number;
        issues: string[];
    }>;
    recommendations: Array<{
        category: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        description: string;
        action: string;
    }>;
}
