"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3StorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let S3StorageProvider = S3StorageProvider_1 = class S3StorageProvider {
    configService;
    logger = new common_1.Logger(S3StorageProvider_1.name);
    bucket;
    region;
    accessKey;
    secretKey;
    endpoint;
    constructor(configService) {
        this.configService = configService;
        this.bucket = this.configService.get('AWS_S3_BUCKET', 'tradebybarter-media');
        this.region = this.configService.get('AWS_S3_REGION', 'us-west-2');
        this.accessKey = this.configService.get('AWS_ACCESS_KEY_ID', '');
        this.secretKey = this.configService.get('AWS_SECRET_ACCESS_KEY', '');
        this.endpoint = this.configService.get('AWS_S3_ENDPOINT');
    }
    simulateDelay(min = 500, max = 2000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    generateMockETag() {
        return '"' + Math.random().toString(36).substring(2, 15) + '"';
    }
    getS3Url(key) {
        if (this.endpoint) {
            return `${this.endpoint}/${this.bucket}/${key}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    async upload(file, key, options) {
        try {
            this.logger.log(`Mock S3 upload started: ${key}`);
            await this.simulateDelay(1000, 3000);
            if (Math.random() < 0.05) {
                throw new Error('Simulated S3 network error');
            }
            const result = {
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
        }
        catch (error) {
            this.logger.error(`Mock S3 upload failed: ${key}`, error.stack);
            throw new Error(`S3 upload failed: ${error.message}`);
        }
    }
    async download(key) {
        try {
            this.logger.log(`Mock S3 download started: ${key}`);
            await this.simulateDelay(500, 1500);
            if (Math.random() < 0.03) {
                throw new Error('Simulated S3 download error');
            }
            const mockData = Buffer.from(`Mock S3 file content for ${key}`, 'utf-8');
            this.logger.log(`Mock S3 download completed: ${key}`);
            return mockData;
        }
        catch (error) {
            this.logger.error(`Mock S3 download failed: ${key}`, error.stack);
            throw new Error(`S3 download failed: ${error.message}`);
        }
    }
    async delete(key) {
        try {
            this.logger.log(`Mock S3 delete started: ${key}`);
            await this.simulateDelay(200, 800);
            if (Math.random() < 0.02) {
                throw new Error('Simulated S3 delete error');
            }
            this.logger.log(`Mock S3 delete completed: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Mock S3 delete failed: ${key}`, error.stack);
            return false;
        }
    }
    getUrl(key, options) {
        const baseUrl = this.getS3Url(key);
        if (options?.expiry) {
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
    async getSignedUrl(key, operation, expiry = 3600) {
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
    async listFiles(prefix, limit) {
        try {
            this.logger.log(`Mock S3 list files: prefix=${prefix}, limit=${limit}`);
            await this.simulateDelay(300, 1000);
            const mockFiles = [];
            const count = Math.min(limit || 100, 50);
            for (let i = 0; i < count; i++) {
                const fileName = prefix
                    ? `${prefix}/file_${i}.jpg`
                    : `mock/file_${i}.jpg`;
                mockFiles.push(fileName);
            }
            this.logger.log(`Mock S3 list completed: ${mockFiles.length} files`);
            return mockFiles;
        }
        catch (error) {
            this.logger.error('Mock S3 list failed', error.stack);
            return [];
        }
    }
    async exists(key) {
        try {
            await this.simulateDelay(100, 500);
            const exists = Math.random() > 0.1;
            this.logger.log(`Mock S3 exists check: ${key} = ${exists}`);
            return exists;
        }
        catch {
            return false;
        }
    }
    async copy(sourceKey, destinationKey) {
        try {
            this.logger.log(`Mock S3 copy: ${sourceKey} -> ${destinationKey}`);
            await this.simulateDelay(500, 1500);
            if (Math.random() < 0.03) {
                throw new Error('Simulated S3 copy error');
            }
            this.logger.log(`Mock S3 copy completed: ${sourceKey} -> ${destinationKey}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Mock S3 copy failed: ${sourceKey} -> ${destinationKey}`, error.stack);
            return false;
        }
    }
    async move(sourceKey, destinationKey) {
        try {
            const copySuccess = await this.copy(sourceKey, destinationKey);
            if (!copySuccess) {
                return false;
            }
            const deleteSuccess = await this.delete(sourceKey);
            return deleteSuccess;
        }
        catch (error) {
            this.logger.error(`Mock S3 move failed: ${sourceKey} -> ${destinationKey}`, error.stack);
            return false;
        }
    }
    async getMetadata(key) {
        try {
            this.logger.log(`Mock S3 get metadata: ${key}`);
            await this.simulateDelay(200, 600);
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
        }
        catch (error) {
            this.logger.error(`Mock S3 get metadata failed: ${key}`, error.stack);
            throw new Error(`Failed to get metadata: ${error.message}`);
        }
    }
    async updateMetadata(key, metadata) {
        try {
            this.logger.log(`Mock S3 update metadata: ${key}`);
            await this.simulateDelay(300, 800);
            if (Math.random() < 0.05) {
                throw new Error('Simulated S3 metadata update error');
            }
            this.logger.log(`Mock S3 metadata updated: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Mock S3 update metadata failed: ${key}`, error.stack);
            return false;
        }
    }
    async initiateMultipartUpload(key, options) {
        await this.simulateDelay(200, 600);
        const uploadId = 'mock-upload-' + Math.random().toString(36).substring(2, 15);
        this.logger.log(`Mock S3 multipart upload initiated: ${key}, uploadId: ${uploadId}`);
        return {
            uploadId,
            bucket: this.bucket,
            key,
        };
    }
    async getUploadPartUrl(bucket, key, uploadId, partNumber) {
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
    async completeMultipartUpload(bucket, key, uploadId, parts) {
        await this.simulateDelay(1000, 2000);
        this.logger.log(`Mock S3 multipart upload completed: ${key}, parts: ${parts.length}`);
        return {
            key,
            url: this.getS3Url(key),
            size: parts.length * 5242880,
            checksum: this.generateMockETag(),
            metadata: {
                uploadId,
                partCount: parts.length,
                completedAt: new Date().toISOString(),
            },
        };
    }
    async abortMultipartUpload(bucket, key, uploadId) {
        await this.simulateDelay(200, 500);
        this.logger.log(`Mock S3 multipart upload aborted: ${key}, uploadId: ${uploadId}`);
        return true;
    }
};
exports.S3StorageProvider = S3StorageProvider;
exports.S3StorageProvider = S3StorageProvider = S3StorageProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3StorageProvider);
//# sourceMappingURL=s3-storage.provider.js.map