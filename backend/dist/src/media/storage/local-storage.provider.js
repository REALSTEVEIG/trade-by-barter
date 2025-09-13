"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalStorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let LocalStorageProvider = LocalStorageProvider_1 = class LocalStorageProvider {
    configService;
    logger = new common_1.Logger(LocalStorageProvider_1.name);
    basePath;
    publicUrl;
    constructor(configService) {
        this.configService = configService;
        this.basePath = this.configService.get('MEDIA_LOCAL_PATH', 'uploads/media');
        this.publicUrl = this.configService.get('MEDIA_PUBLIC_URL', 'http://localhost:4000');
        this.ensureDirectoryExists();
    }
    async ensureDirectoryExists() {
        try {
            await fs.access(this.basePath);
        }
        catch {
            await fs.mkdir(this.basePath, { recursive: true });
            this.logger.log(`Created local storage directory: ${this.basePath}`);
        }
    }
    generateChecksum(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    getFullPath(key) {
        return path.join(this.basePath, key);
    }
    getPublicUrl(key) {
        return `${this.publicUrl}/media/${key}`;
    }
    async upload(file, key, options) {
        try {
            const fullPath = this.getFullPath(key);
            const directory = path.dirname(fullPath);
            await fs.mkdir(directory, { recursive: true });
            await fs.writeFile(fullPath, file);
            const checksum = this.generateChecksum(file);
            const stats = await fs.stat(fullPath);
            const result = {
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
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${key}`, error.stack);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
    async download(key) {
        try {
            const fullPath = this.getFullPath(key);
            const buffer = await fs.readFile(fullPath);
            this.logger.log(`File downloaded successfully: ${key}`);
            return buffer;
        }
        catch (error) {
            this.logger.error(`Failed to download file: ${key}`, error.stack);
            throw new Error(`Download failed: ${error.message}`);
        }
    }
    async delete(key) {
        try {
            const fullPath = this.getFullPath(key);
            await fs.unlink(fullPath);
            try {
                const directory = path.dirname(fullPath);
                const files = await fs.readdir(directory);
                if (files.length === 0) {
                    await fs.rmdir(directory);
                }
            }
            catch {
            }
            this.logger.log(`File deleted successfully: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${key}`, error.stack);
            return false;
        }
    }
    getUrl(key, options) {
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
    async listFiles(prefix, limit) {
        try {
            const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;
            const files = [];
            const scanDirectory = async (dir, currentPrefix = '') => {
                if (limit && files.length >= limit)
                    return;
                try {
                    const entries = await fs.readdir(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        if (limit && files.length >= limit)
                            break;
                        const fullPath = path.join(dir, entry.name);
                        const relativePath = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
                        if (entry.isDirectory()) {
                            await scanDirectory(fullPath, relativePath);
                        }
                        else {
                            files.push(relativePath);
                        }
                    }
                }
                catch (error) {
                }
            };
            await scanDirectory(searchPath, prefix);
            return files.slice(0, limit);
        }
        catch (error) {
            this.logger.error(`Failed to list files with prefix: ${prefix}`, error.stack);
            return [];
        }
    }
    async exists(key) {
        try {
            const fullPath = this.getFullPath(key);
            await fs.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async copy(sourceKey, destinationKey) {
        try {
            const sourcePath = this.getFullPath(sourceKey);
            const destPath = this.getFullPath(destinationKey);
            const destDir = path.dirname(destPath);
            await fs.mkdir(destDir, { recursive: true });
            await fs.copyFile(sourcePath, destPath);
            this.logger.log(`File copied successfully: ${sourceKey} -> ${destinationKey}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to copy file: ${sourceKey} -> ${destinationKey}`, error.stack);
            return false;
        }
    }
    async move(sourceKey, destinationKey) {
        try {
            const sourcePath = this.getFullPath(sourceKey);
            const destPath = this.getFullPath(destinationKey);
            const destDir = path.dirname(destPath);
            await fs.mkdir(destDir, { recursive: true });
            await fs.rename(sourcePath, destPath);
            this.logger.log(`File moved successfully: ${sourceKey} -> ${destinationKey}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to move file: ${sourceKey} -> ${destinationKey}`, error.stack);
            return false;
        }
    }
    async getMetadata(key) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get metadata for file: ${key}`, error.stack);
            throw new Error(`Failed to get metadata: ${error.message}`);
        }
    }
    async updateMetadata(key, metadata) {
        this.logger.warn(`Metadata update not supported for local storage: ${key}`);
        return false;
    }
    async getStorageStats() {
        try {
            let totalSize = 0;
            let totalFiles = 0;
            const calculateSize = async (dir) => {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await calculateSize(fullPath);
                    }
                    else {
                        const stats = await fs.stat(fullPath);
                        totalSize += stats.size;
                        totalFiles++;
                    }
                }
            };
            await calculateSize(this.basePath);
            const stats = await fs.stat(this.basePath);
            const availableSpace = Number.MAX_SAFE_INTEGER;
            return {
                totalSize,
                totalFiles,
                availableSpace,
            };
        }
        catch (error) {
            this.logger.error('Failed to get storage statistics', error.stack);
            return {
                totalSize: 0,
                totalFiles: 0,
                availableSpace: 0,
            };
        }
    }
    async cleanupEmptyDirectories() {
        let cleanedCount = 0;
        const cleanupDirectory = async (dir) => {
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
                    }
                    else {
                        isEmpty = false;
                    }
                }
                if (isEmpty) {
                    await fs.rmdir(dir);
                    cleanedCount++;
                    return true;
                }
                return false;
            }
            catch {
                return false;
            }
        };
        await cleanupDirectory(this.basePath);
        if (cleanedCount > 0) {
            this.logger.log(`Cleaned up ${cleanedCount} empty directories`);
        }
        return cleanedCount;
    }
};
exports.LocalStorageProvider = LocalStorageProvider;
exports.LocalStorageProvider = LocalStorageProvider = LocalStorageProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageProvider);
//# sourceMappingURL=local-storage.provider.js.map