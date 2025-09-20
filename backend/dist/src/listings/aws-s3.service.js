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
var AwsS3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
let AwsS3Service = AwsS3Service_1 = class AwsS3Service {
    configService;
    logger = new common_1.Logger(AwsS3Service_1.name);
    s3;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        const region = this.configService.get('AWS_REGION', 'eu-north-1');
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID', '');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY', '');
        this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME', 'tradebybarter');
        this.s3 = new aws_sdk_1.S3({
            region,
            accessKeyId,
            secretAccessKey,
        });
        this.logger.log(`S3 Service initialized for bucket: ${this.bucketName} in region: ${region}`);
    }
    async uploadFile(file, folder = 'listings') {
        try {
            const fileExtension = path.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${fileExtension}`;
            const key = `${folder}/${filename}`;
            const uploadParams = {
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            this.logger.log(`Uploading file to S3: ${key}`);
            const result = await this.s3.upload(uploadParams).promise();
            this.logger.log(`File uploaded successfully: ${result.Location}`);
            return {
                key,
                url: result.Location,
                filename,
            };
        }
        catch (error) {
            this.logger.error(`S3 upload failed: ${error.message}`, error.stack);
            throw new Error(`Failed to upload file to S3: ${error.message}`);
        }
    }
    async deleteFile(key) {
        try {
            await this.s3.deleteObject({
                Bucket: this.bucketName,
                Key: key,
            }).promise();
            this.logger.log(`File deleted from S3: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`S3 delete failed: ${error.message}`, error.stack);
            return false;
        }
    }
    getFileUrl(key) {
        return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
    }
};
exports.AwsS3Service = AwsS3Service;
exports.AwsS3Service = AwsS3Service = AwsS3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AwsS3Service);
//# sourceMappingURL=aws-s3.service.js.map