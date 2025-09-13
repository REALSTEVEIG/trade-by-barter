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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelChunkedUploadDto = exports.ResumeChunkedUploadDto = exports.ChunkedUploadResponseDto = exports.ChunkedUploadSessionDto = exports.CompleteChunkedUploadDto = exports.UploadChunkDto = exports.InitiateChunkedUploadDto = exports.ChunkedUploadStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const upload_dto_1 = require("./upload.dto");
var ChunkedUploadStatus;
(function (ChunkedUploadStatus) {
    ChunkedUploadStatus["INITIATED"] = "INITIATED";
    ChunkedUploadStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ChunkedUploadStatus["COMPLETED"] = "COMPLETED";
    ChunkedUploadStatus["FAILED"] = "FAILED";
    ChunkedUploadStatus["CANCELLED"] = "CANCELLED";
    ChunkedUploadStatus["EXPIRED"] = "EXPIRED";
})(ChunkedUploadStatus || (exports.ChunkedUploadStatus = ChunkedUploadStatus = {}));
class InitiateChunkedUploadDto extends upload_dto_1.UploadDto {
    totalSize;
    filename;
    mimeType;
    chunkSize = 5242880;
    timeoutSeconds = 3600;
    checksum;
    resumeSessionId;
}
exports.InitiateChunkedUploadDto = InitiateChunkedUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total file size in bytes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiateChunkedUploadDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateChunkedUploadDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File MIME type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateChunkedUploadDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chunk size in bytes (default: 5MB)', default: 5242880 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1048576),
    (0, class_validator_1.Max)(104857600),
    __metadata("design:type", Number)
], InitiateChunkedUploadDto.prototype, "chunkSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload timeout in seconds', default: 3600 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(60),
    (0, class_validator_1.Max)(86400),
    __metadata("design:type", Number)
], InitiateChunkedUploadDto.prototype, "timeoutSeconds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File checksum for integrity verification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateChunkedUploadDto.prototype, "checksum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Resume from existing upload session' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateChunkedUploadDto.prototype, "resumeSessionId", void 0);
class UploadChunkDto {
    sessionId;
    chunkNumber;
    chunkSize;
    chunkChecksum;
    isFinalChunk;
}
exports.UploadChunkDto = UploadChunkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload session ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadChunkDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chunk number (0-based)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UploadChunkDto.prototype, "chunkNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chunk size in bytes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UploadChunkDto.prototype, "chunkSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chunk checksum for integrity verification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadChunkDto.prototype, "chunkChecksum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is this the final chunk' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadChunkDto.prototype, "isFinalChunk", void 0);
class CompleteChunkedUploadDto {
    sessionId;
    finalChecksum;
    startProcessing = true;
}
exports.CompleteChunkedUploadDto = CompleteChunkedUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload session ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteChunkedUploadDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Final file checksum for verification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteChunkedUploadDto.prototype, "finalChecksum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start processing immediately', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CompleteChunkedUploadDto.prototype, "startProcessing", void 0);
class ChunkedUploadSessionDto {
    id;
    filename;
    mimeType;
    totalSize;
    chunkSize;
    totalChunks;
    uploadedChunks;
    progress;
    status;
    uploadedChunkNumbers;
    missingChunkNumbers;
    error;
    createdAt;
    updatedAt;
    expiresAt;
    userId;
    mediaId;
}
exports.ChunkedUploadSessionDto = ChunkedUploadSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID' }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename' }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File MIME type' }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total file size in bytes' }),
    __metadata("design:type", Number)
], ChunkedUploadSessionDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chunk size in bytes' }),
    __metadata("design:type", Number)
], ChunkedUploadSessionDto.prototype, "chunkSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of chunks' }),
    __metadata("design:type", Number)
], ChunkedUploadSessionDto.prototype, "totalChunks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of uploaded chunks' }),
    __metadata("design:type", Number)
], ChunkedUploadSessionDto.prototype, "uploadedChunks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload progress percentage' }),
    __metadata("design:type", Number)
], ChunkedUploadSessionDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session status', enum: ChunkedUploadStatus }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Uploaded chunk numbers' }),
    __metadata("design:type", Array)
], ChunkedUploadSessionDto.prototype, "uploadedChunkNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Missing chunk numbers' }),
    __metadata("design:type", Array)
], ChunkedUploadSessionDto.prototype, "missingChunkNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload error message' }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session creation timestamp' }),
    __metadata("design:type", Date)
], ChunkedUploadSessionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session update timestamp' }),
    __metadata("design:type", Date)
], ChunkedUploadSessionDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session expiry timestamp' }),
    __metadata("design:type", Date)
], ChunkedUploadSessionDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media ID after completion' }),
    __metadata("design:type", String)
], ChunkedUploadSessionDto.prototype, "mediaId", void 0);
class ChunkedUploadResponseDto {
    message;
    session;
    nextChunkNumber;
    uploadUrl;
    retryDelay;
}
exports.ChunkedUploadResponseDto = ChunkedUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    __metadata("design:type", String)
], ChunkedUploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload session', type: ChunkedUploadSessionDto }),
    __metadata("design:type", ChunkedUploadSessionDto)
], ChunkedUploadResponseDto.prototype, "session", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Next chunk number to upload' }),
    __metadata("design:type", Number)
], ChunkedUploadResponseDto.prototype, "nextChunkNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload URL for the next chunk' }),
    __metadata("design:type", String)
], ChunkedUploadResponseDto.prototype, "uploadUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Retry delay in seconds' }),
    __metadata("design:type", Number)
], ChunkedUploadResponseDto.prototype, "retryDelay", void 0);
class ResumeChunkedUploadDto {
    sessionId;
    verifyIntegrity = true;
}
exports.ResumeChunkedUploadDto = ResumeChunkedUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID to resume' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResumeChunkedUploadDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Verify chunk integrity before resuming' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ResumeChunkedUploadDto.prototype, "verifyIntegrity", void 0);
class CancelChunkedUploadDto {
    sessionId;
    cleanup = true;
}
exports.CancelChunkedUploadDto = CancelChunkedUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID to cancel' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelChunkedUploadDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cleanup uploaded chunks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CancelChunkedUploadDto.prototype, "cleanup", void 0);
//# sourceMappingURL=chunked-upload.dto.js.map