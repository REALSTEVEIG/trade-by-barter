export interface ProcessingOptions {
    quality?: number;
    width?: number;
    height?: number;
    format?: string;
    compressionLevel?: number;
    preserveMetadata?: boolean;
    watermark?: WatermarkOptions;
}
export interface WatermarkOptions {
    text?: string;
    image?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
    fontSize?: number;
    color?: string;
}
export interface ProcessingResult {
    buffer: Buffer;
    metadata: {
        width?: number;
        height?: number;
        format: string;
        size: number;
        quality?: number;
        duration?: number;
    };
}
export interface ThumbnailOptions {
    width: number;
    height: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
export interface VideoProcessingOptions extends ProcessingOptions {
    codec?: string;
    bitrate?: string;
    framerate?: number;
    duration?: number;
    startTime?: number;
    thumbnails?: {
        count: number;
        interval?: number;
        timestamps?: number[];
    };
}
export interface AudioProcessingOptions extends ProcessingOptions {
    codec?: string;
    bitrate?: string;
    sampleRate?: number;
    channels?: number;
    noiseReduction?: boolean;
}
export interface MediaProcessor {
    processImage(buffer: Buffer, options: ProcessingOptions): Promise<ProcessingResult>;
    generateImageThumbnail(buffer: Buffer, options: ThumbnailOptions): Promise<ProcessingResult>;
    processVideo(buffer: Buffer, options: VideoProcessingOptions): Promise<ProcessingResult>;
    generateVideoThumbnail(buffer: Buffer, options: ThumbnailOptions & {
        timestamp?: number;
    }): Promise<ProcessingResult>;
    processAudio(buffer: Buffer, options: AudioProcessingOptions): Promise<ProcessingResult>;
    extractMetadata(buffer: Buffer, mimeType: string): Promise<Record<string, any>>;
    validateFile(buffer: Buffer, expectedMimeType?: string): Promise<boolean>;
    optimizeForNigeria(buffer: Buffer, mimeType: string): Promise<ProcessingResult>;
}
export interface ProcessingJob {
    id: string;
    mediaId: string;
    type: 'RESIZE' | 'COMPRESS' | 'CONVERT' | 'THUMBNAIL' | 'WATERMARK' | 'METADATA_EXTRACT';
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    options: ProcessingOptions | VideoProcessingOptions | AudioProcessingOptions;
    progress: number;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    retryCount: number;
    maxRetries: number;
}
