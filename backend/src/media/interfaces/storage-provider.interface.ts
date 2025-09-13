export interface UploadOptions {
  bucket?: string;
  region?: string;
  acl?: 'private' | 'public-read' | 'public-read-write';
  contentType?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  checksum?: string;
  metadata?: Record<string, any>;
}

export interface UrlOptions {
  expiry?: number; // seconds
  download?: boolean;
  filename?: string;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  upload(file: Buffer, key: string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<boolean>;

  /**
   * Get a public or signed URL for a file
   */
  getUrl(key: string, options?: UrlOptions): string | Promise<string>;

  /**
   * List files in storage with optional prefix
   */
  listFiles(prefix?: string, limit?: number): Promise<string[]>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Copy a file within storage
   */
  copy(sourceKey: string, destinationKey: string): Promise<boolean>;

  /**
   * Move a file within storage
   */
  move(sourceKey: string, destinationKey: string): Promise<boolean>;

  /**
   * Get file metadata
   */
  getMetadata(key: string): Promise<Record<string, any>>;

  /**
   * Update file metadata
   */
  updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean>;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'cloudinary' | 'azure' | 'gcs';
  region?: string;
  bucket?: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
  basePath?: string;
  publicUrl?: string;
}