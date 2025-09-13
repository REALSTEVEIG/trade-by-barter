import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { 
  StorageProvider, 
  UploadOptions, 
  UploadResult, 
  UrlOptions 
} from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly basePath: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get<string>('MEDIA_LOCAL_PATH', 'uploads/media');
    this.publicUrl = this.configService.get<string>('MEDIA_PUBLIC_URL', 'http://localhost:4000');
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.basePath);
    } catch {
      await fs.mkdir(this.basePath, { recursive: true });
      this.logger.log(`Created local storage directory: ${this.basePath}`);
    }
  }

  private generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private getFullPath(key: string): string {
    return path.join(this.basePath, key);
  }

  private getPublicUrl(key: string): string {
    return `${this.publicUrl}/media/${key}`;
  }

  async upload(file: Buffer, key: string, options?: UploadOptions): Promise<UploadResult> {
    try {
      const fullPath = this.getFullPath(key);
      const directory = path.dirname(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });
      
      // Write file
      await fs.writeFile(fullPath, file);
      
      // Generate checksum
      const checksum = this.generateChecksum(file);
      
      // Get file stats
      const stats = await fs.stat(fullPath);
      
      const result: UploadResult = {
        key,
        url: this.getPublicUrl(key),
        size: stats.size,
        checksum,
        metadata: {
          contentType: options?.contentType,
          uploadedAt: new Date().toISOString(),
          ...options?.metadata,
        },
      };

      this.logger.log(`File uploaded successfully: ${key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error.stack);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const fullPath = this.getFullPath(key);
      const buffer = await fs.readFile(fullPath);
      this.logger.log(`File downloaded successfully: ${key}`);
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to download file: ${key}`, error.stack);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(key);
      await fs.unlink(fullPath);
      
      // Try to remove empty directories
      try {
        const directory = path.dirname(fullPath);
        const files = await fs.readdir(directory);
        if (files.length === 0) {
          await fs.rmdir(directory);
        }
      } catch {
        // Ignore errors when cleaning up directories
      }
      
      this.logger.log(`File deleted successfully: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error.stack);
      return false;
    }
  }

  getUrl(key: string, options?: UrlOptions): string {
    let url = this.getPublicUrl(key);
    
    if (options?.download) {
      const params = new URLSearchParams();
      params.set('download', 'true');
      if (options.filename) {
        params.set('filename', options.filename);
      }
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  async listFiles(prefix?: string, limit?: number): Promise<string[]> {
    try {
      const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;
      
      const files: string[] = [];
      
      const scanDirectory = async (dir: string, currentPrefix = ''): Promise<void> => {
        if (limit && files.length >= limit) return;
        
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            if (limit && files.length >= limit) break;
            
            const fullPath = path.join(dir, entry.name);
            const relativePath = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
            
            if (entry.isDirectory()) {
              await scanDirectory(fullPath, relativePath);
            } else {
              files.push(relativePath);
            }
          }
        } catch (error) {
          // Skip directories that can't be read
        }
      };
      
      await scanDirectory(searchPath, prefix);
      return files.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to list files with prefix: ${prefix}`, error.stack);
      return [];
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(key);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<boolean> {
    try {
      const sourcePath = this.getFullPath(sourceKey);
      const destPath = this.getFullPath(destinationKey);
      const destDir = path.dirname(destPath);
      
      // Ensure destination directory exists
      await fs.mkdir(destDir, { recursive: true });
      
      // Copy file
      await fs.copyFile(sourcePath, destPath);
      
      this.logger.log(`File copied successfully: ${sourceKey} -> ${destinationKey}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to copy file: ${sourceKey} -> ${destinationKey}`, error.stack);
      return false;
    }
  }

  async move(sourceKey: string, destinationKey: string): Promise<boolean> {
    try {
      const sourcePath = this.getFullPath(sourceKey);
      const destPath = this.getFullPath(destinationKey);
      const destDir = path.dirname(destPath);
      
      // Ensure destination directory exists
      await fs.mkdir(destDir, { recursive: true });
      
      // Move file
      await fs.rename(sourcePath, destPath);
      
      this.logger.log(`File moved successfully: ${sourceKey} -> ${destinationKey}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to move file: ${sourceKey} -> ${destinationKey}`, error.stack);
      return false;
    }
  }

  async getMetadata(key: string): Promise<Record<string, any>> {
    try {
      const fullPath = this.getFullPath(key);
      const stats = await fs.stat(fullPath);
      
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mode: stats.mode,
        uid: stats.uid,
        gid: stats.gid,
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata for file: ${key}`, error.stack);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  async updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean> {
    // Local storage doesn't support metadata updates
    // This would typically be stored in a separate metadata file or database
    this.logger.warn(`Metadata update not supported for local storage: ${key}`);
    return false;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    totalFiles: number;
    availableSpace: number;
  }> {
    try {
      let totalSize = 0;
      let totalFiles = 0;
      
      const calculateSize = async (dir: string): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await calculateSize(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            totalFiles++;
          }
        }
      };
      
      await calculateSize(this.basePath);
      
      // Get available space (this is a simplified calculation)
      const stats = await fs.stat(this.basePath);
      const availableSpace = Number.MAX_SAFE_INTEGER; // Local storage doesn't have a real limit
      
      return {
        totalSize,
        totalFiles,
        availableSpace,
      };
    } catch (error) {
      this.logger.error('Failed to get storage statistics', error.stack);
      return {
        totalSize: 0,
        totalFiles: 0,
        availableSpace: 0,
      };
    }
  }

  /**
   * Cleanup empty directories
   */
  async cleanupEmptyDirectories(): Promise<number> {
    let cleanedCount = 0;
    
    const cleanupDirectory = async (dir: string): Promise<boolean> => {
      try {
        const entries = await fs.readdir(dir);
        
        if (entries.length === 0) {
          await fs.rmdir(dir);
          cleanedCount++;
          return true;
        }
        
        let isEmpty = true;
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stats = await fs.stat(fullPath);
          
          if (stats.isDirectory()) {
            const wasRemoved = await cleanupDirectory(fullPath);
            if (!wasRemoved) {
              isEmpty = false;
            }
          } else {
            isEmpty = false;
          }
        }
        
        if (isEmpty) {
          await fs.rmdir(dir);
          cleanedCount++;
          return true;
        }
        
        return false;
      } catch {
        return false;
      }
    };
    
    await cleanupDirectory(this.basePath);
    
    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} empty directories`);
    }
    
    return cleanedCount;
  }
}