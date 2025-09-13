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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let UploadService = class UploadService {
    prisma;
    uploadDir = 'uploads/listings';
    baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    constructor(prisma) {
        this.prisma = prisma;
        this.ensureUploadDirectory();
    }
    async ensureUploadDirectory() {
        try {
            await fs.access(this.uploadDir);
        }
        catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }
    generateFileName(originalName) {
        const ext = path.extname(originalName);
        const name = (0, uuid_1.v4)();
        return `${name}${ext}`;
    }
    validateFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File size cannot exceed 5MB');
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed');
        }
    }
    async uploadListingImages(listingId, userId, files) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, userId: true, isActive: true },
        });
        if (!listing || !listing.isActive) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only upload images to your own listings');
        }
        const existingImageCount = await this.prisma.media.count({
            where: { listingId },
        });
        if (existingImageCount + files.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images allowed per listing');
        }
        files.forEach(file => this.validateFile(file));
        const uploadedUrls = [];
        const mediaRecords = [];
        try {
            for (const file of files) {
                const fileName = this.generateFileName(file.originalname);
                const filePath = path.join(this.uploadDir, fileName);
                const publicUrl = `${this.baseUrl}/${this.uploadDir}/${fileName}`;
                await fs.writeFile(filePath, file.buffer);
                uploadedUrls.push(publicUrl);
                mediaRecords.push({
                    filename: fileName,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: publicUrl,
                    listingId,
                });
            }
            await this.prisma.media.createMany({
                data: mediaRecords,
            });
            return {
                message: `${files.length} image(s) uploaded successfully`,
                urls: uploadedUrls,
            };
        }
        catch (error) {
            for (const url of uploadedUrls) {
                const fileName = path.basename(url);
                const filePath = path.join(this.uploadDir, fileName);
                try {
                    await fs.unlink(filePath);
                }
                catch {
                }
            }
            throw error;
        }
    }
    async deleteListingImage(listingId, imageId, userId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, userId: true, isActive: true },
        });
        if (!listing || !listing.isActive) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete images from your own listings');
        }
        const media = await this.prisma.media.findUnique({
            where: { id: imageId, listingId },
        });
        if (!media) {
            throw new common_1.NotFoundException('Image not found');
        }
        try {
            const fileName = path.basename(media.url);
            const filePath = path.join(this.uploadDir, fileName);
            await fs.unlink(filePath);
        }
        catch {
        }
        await this.prisma.media.delete({
            where: { id: imageId },
        });
        return { message: 'Image deleted successfully' };
    }
    async getListingImages(listingId) {
        const media = await this.prisma.media.findMany({
            where: { listingId },
            select: { url: true },
            orderBy: { uploadedAt: 'asc' },
        });
        return media.map(m => m.url);
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UploadService);
//# sourceMappingURL=upload.service.js.map