import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  StorageProvider, 
  UploadOptions, 
  UploadResult, 
  UrlOptions 
} from '../interfaces/storage-provider.interface';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'tradebybarter-media');
    this.region = this.configService.get<string>('AWS_S3_REGION', 'us-west-2');
    this.accessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    this.secretKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY', '');
    this.endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
  }

  private simulateDelay(min = 500, max = 2000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateMockETag(): string {
    return '"' + Math.random().toString(36).substring(2, 15) + '"';
  }

  private getS3Url(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async upload(file: Buffer, key: string, options?: UploadOptions): Promise<UploadResult> {
    try {
      this.logger.log(`Mock S3 upload started: ${key}`);
      
      // Simulate network delay
      await this.simulateDelay(1000, 3000);
      
      // Simulate occasional failures (5% failure rate)
      if (Math.random() < 0.05) {
        throw new Error('Simulated S3 network error');
      }
      
      const result: UploadResult = {
        key,
        url: this.getS3Url(key),
        size: file.length,
        checksum: this.generateMockETag(),
        metadata: {
          contentType: options?.contentType,
          bucket: this.bucket,
          region: this.region,
          acl: options?.acl || 'private',
          uploadedAt: new Date().toISOString(),
          provider: 'S3',
          ...options?.metadata,
        },
      };

      this.logger.log(`Mock S3 upload completed: ${key} (${file.length} bytes)`);
      return result;
    } catch (error) {
      this.logger.error(`Mock S3 upload failed: ${key}`, error.stack);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      this.logger.log(`Mock S3 download started: ${key}`);
      
      // Simulate network delay
      await this.simulateDelay(500, 1500);
      
      // Simulate occasional failures (3% failure rate)
      if (Math.random() < 0.03) {
        throw new Error('Simulated S3 download error');
      }
      
      // Return mock binary data
      const mockData = Buffer.from(`Mock S3 file content for ${key}`, 'utf-8');
      
      this.logger.log(`Mock S3 download completed: ${key}`);
      return mockData;
    } catch (error) {
      this.logger.error(`Mock S3 download failed: ${key}`, error.stack);
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      this.logger.log(`Mock S3 delete started: ${key}`);
      
      // Simulate network delay
      await this.simulateDelay(200, 800);
      
      // Simulate occasional failures (2% failure rate)
      if (Math.random() < 0.02) {
        throw new Error('Simulated S3 delete error');
      }
      
      this.logger.log(`Mock S3 delete completed: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Mock S3 delete failed: ${key}`, error.stack);
      return false;
    }
  }

  getUrl(key: string, options?: UrlOptions): string {
    const baseUrl = this.getS3Url(key);
    
    if (options?.expiry) {
      // For signed URLs, append mock signature params
      const params = new URLSearchParams();
      params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
      params.set('X-Amz-Credential', `${this.accessKey}/20240101/${this.region}/s3/aws4_request`);
      params.set('X-Amz-Date', '20240101T000000Z');
      params.set('X-Amz-Expires', options.expiry.toString());
      params.set('X-Amz-SignedHeaders', 'host');
      params.set('X-Amz-Signature', Math.random().toString(36).substring(2));
      
      if (options.download) {
        params.set('response-content-disposition', `attachment; filename="${options.filename || key}"`);
      }
      
      return `${baseUrl}?${params.toString()}`;
    }
    
    return baseUrl;
  }

  async getSignedUrl(key: string, operation: 'getObject' | 'putObject', expiry = 3600): Promise<string> {
    // Simulate signed URL generation
    await this.simulateDelay(100, 300);
    
    const params = new URLSearchParams();
    params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
    params.set('X-Amz-Credential', `${this.accessKey}/20240101/${this.region}/s3/aws4_request`);
    params.set('X-Amz-Date', '20240101T000000Z');
    params.set('X-Amz-Expires', expiry.toString());
    params.set('X-Amz-SignedHeaders', 'host');
    params.set('X-Amz-Signature', Math.random().toString(36).substring(2));
    
    const baseUrl = this.getS3Url(key);
    return `${baseUrl}?${params.toString()}`;
  }

  async listFiles(prefix?: string, limit?: number): Promise<string[]> {
    try {
      this.logger.log(`Mock S3 list files: prefix=${prefix}, limit=${limit}`);
      
      // Simulate network delay
      await this.simulateDelay(300, 1000);
      
      // Generate mock file list
      const mockFiles: string[] = [];
      const count = Math.min(limit || 100, 50); // Max 50 for simulation
      
      for (let i = 0; i < count; i++) {
        const fileName = prefix 
          ? `${prefix}/file_${i}.jpg`
          : `mock/file_${i}.jpg`;
        mockFiles.push(fileName);
      }
      
      this.logger.log(`Mock S3 list completed: ${mockFiles.length} files`);
      return mockFiles;
    } catch (error) {
      this.logger.error('Mock S3 list failed', error.stack);
      return [];
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      // Simulate network delay
      await this.simulateDelay(100, 500);
      
      // Simulate 90% existence rate for mock data
      const exists = Math.random() > 0.1;
      
      this.logger.log(`Mock S3 exists check: ${key} = ${exists}`);
      return exists;
    } catch {
      return false;
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<boolean> {
    try {
      this.logger.log(`Mock S3 copy: ${sourceKey} -> ${destinationKey}`);
      
      // Simulate network delay
      await this.simulateDelay(500, 1500);
      
      // Simulate occasional failures (3% failure rate)
      if (Math.random() < 0.03) {
        throw new Error('Simulated S3 copy error');
      }
      
      this.logger.log(`Mock S3 copy completed: ${sourceKey} -> ${destinationKey}`);
      return true;
    } catch (error) {
      this.logger.error(`Mock S3 copy failed: ${sourceKey} -> ${destinationKey}`, error.stack);
      return false;
    }
  }

  async move(sourceKey: string, destinationKey: string): Promise<boolean> {
    try {
      // S3 doesn't have native move, so we copy then delete
      const copySuccess = await this.copy(sourceKey, destinationKey);
      if (!copySuccess) {
        return false;
      }
      
      const deleteSuccess = await this.delete(sourceKey);
      return deleteSuccess;
    } catch (error) {
      this.logger.error(`Mock S3 move failed: ${sourceKey} -> ${destinationKey}`, error.stack);
      return false;
    }
  }

  async getMetadata(key: string): Promise<Record<string, any>> {
    try {
      this.logger.log(`Mock S3 get metadata: ${key}`);
      
      // Simulate network delay
      await this.simulateDelay(200, 600);
      
      // Return mock metadata
      return {
        contentType: 'image/jpeg',
        contentLength: Math.floor(Math.random() * 1000000) + 100000,
        lastModified: new Date(),
        etag: this.generateMockETag(),
        bucket: this.bucket,
        key,
        storageClass: 'STANDARD',
        serverSideEncryption: 'AES256',
        metadata: {
          originalName: key.split('/').pop(),
          uploadedBy: 'mock-user',
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Mock S3 get metadata failed: ${key}`, error.stack);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  async updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      this.logger.log(`Mock S3 update metadata: ${key}`);
      
      // Simulate network delay
      await this.simulateDelay(300, 800);
      
      // Simulate occasional failures (5% failure rate)
      if (Math.random() < 0.05) {
        throw new Error('Simulated S3 metadata update error');
      }
      
      this.logger.log(`Mock S3 metadata updated: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Mock S3 update metadata failed: ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Get multipart upload URLs for chunked uploads
   */
  async initiateMultipartUpload(key: string, options?: UploadOptions): Promise<{
    uploadId: string;
    bucket: string;
    key: string;
  }> {
    await this.simulateDelay(200, 600);
    
    const uploadId = 'mock-upload-' + Math.random().toString(36).substring(2, 15);
    
    this.logger.log(`Mock S3 multipart upload initiated: ${key}, uploadId: ${uploadId}`);
    
    return {
      uploadId,
      bucket: this.bucket,
      key,
    };
  }

  /**
   * Get signed URL for uploading a specific part
   */
  async getUploadPartUrl(bucket: string, key: string, uploadId: string, partNumber: number): Promise<string> {
    await this.simulateDelay(100, 300);
    
    const params = new URLSearchParams();
    params.set('partNumber', partNumber.toString());
    params.set('uploadId', uploadId);
    params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
    params.set('X-Amz-Credential', `${this.accessKey}/20240101/${this.region}/s3/aws4_request`);
    params.set('X-Amz-Date', '20240101T000000Z');
    params.set('X-Amz-Expires', '3600');
    params.set('X-Amz-SignedHeaders', 'host');
    params.set('X-Amz-Signature', Math.random().toString(36).substring(2));
    
    const baseUrl = this.getS3Url(key);
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Complete multipart upload
   */
  async completeMultipartUpload(
    bucket: string, 
    key: string, 
    uploadId: string, 
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<UploadResult> {
    await this.simulateDelay(1000, 2000);
    
    this.logger.log(`Mock S3 multipart upload completed: ${key}, parts: ${parts.length}`);
    
    return {
      key,
      url: this.getS3Url(key),
      size: parts.length * 5242880, // Assume 5MB per part
      checksum: this.generateMockETag(),
      metadata: {
        uploadId,
        partCount: parts.length,
        completedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Abort multipart upload
   */
  async abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<boolean> {
    await this.simulateDelay(200, 500);
    
    this.logger.log(`Mock S3 multipart upload aborted: ${key}, uploadId: ${uploadId}`);
    return true;
  }
}