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
    duration?: number; // for videos/audio
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
  /**
   * Process an image file
   */
  processImage(buffer: Buffer, options: ProcessingOptions): Promise<ProcessingResult>;

  /**
   * Generate image thumbnail
   */
  generateImageThumbnail(buffer: Buffer, options: ThumbnailOptions): Promise<ProcessingResult>;

  /**
   * Process a video file
   */
  processVideo(buffer: Buffer, options: VideoProcessingOptions): Promise<ProcessingResult>;

  /**
   * Generate video thumbnail
   */
  generateVideoThumbnail(buffer: Buffer, options: ThumbnailOptions & { timestamp?: number }): Promise<ProcessingResult>;

  /**
   * Process an audio file
   */
  processAudio(buffer: Buffer, options: AudioProcessingOptions): Promise<ProcessingResult>;

  /**
   * Extract metadata from media file
   */
  extractMetadata(buffer: Buffer, mimeType: string): Promise<Record<string, any>>;

  /**
   * Validate file format and integrity
   */
  validateFile(buffer: Buffer, expectedMimeType?: string): Promise<boolean>;

  /**
   * Optimize file for Nigerian network conditions
   */
  optimizeForNigeria(buffer: Buffer, mimeType: string): Promise<ProcessingResult>;
}

export interface ProcessingJob {
  id: string;
  mediaId: string;
  type: 'RESIZE' | 'COMPRESS' | 'CONVERT' | 'THUMBNAIL' | 'WATERMARK' | 'METADATA_EXTRACT';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  options: ProcessingOptions | VideoProcessingOptions | AudioProcessingOptions;
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}