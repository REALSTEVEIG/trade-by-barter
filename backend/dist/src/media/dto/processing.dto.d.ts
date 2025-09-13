export declare enum ProcessingJobType {
    RESIZE = "RESIZE",
    COMPRESS = "COMPRESS",
    CONVERT = "CONVERT",
    THUMBNAIL = "THUMBNAIL",
    WATERMARK = "WATERMARK",
    METADATA_EXTRACT = "METADATA_EXTRACT",
    VIRUS_SCAN = "VIRUS_SCAN",
    CONTENT_MODERATION = "CONTENT_MODERATION"
}
export declare enum JobStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    RETRYING = "RETRYING"
}
export declare enum JobPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class ProcessMediaDto {
    mediaId: string;
    type: ProcessingJobType;
    priority: JobPriority;
    options?: Record<string, any>;
}
export declare class ProcessingJobResponseDto {
    id: string;
    mediaId: string;
    type: ProcessingJobType;
    status: JobStatus;
    priority: JobPriority;
    options: Record<string, any>;
    progress: number;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    retryCount: number;
    maxRetries: number;
    error?: string;
    queueName: string;
    jobId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BatchProcessingDto {
    mediaIds: string[];
    type: ProcessingJobType;
    priority: JobPriority;
    options?: Record<string, any>;
    sequential?: boolean;
}
export declare class BatchProcessingResponseDto {
    message: string;
    jobs: ProcessingJobResponseDto[];
    successCount: number;
    failedCount: number;
    failures: Array<{
        mediaId: string;
        error: string;
    }>;
}
export declare class ProcessingStatsDto {
    totalJobs: number;
    pendingJobs: number;
    processingJobs: number;
    completedJobs: number;
    failedJobs: number;
    avgProcessingTime: number;
    successRate: number;
    jobsByType: Record<ProcessingJobType, number>;
    jobsByPriority: Record<JobPriority, number>;
    queueSize: number;
    activeWorkers: number;
}
