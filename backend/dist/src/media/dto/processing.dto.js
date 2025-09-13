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
exports.ProcessingStatsDto = exports.BatchProcessingResponseDto = exports.BatchProcessingDto = exports.ProcessingJobResponseDto = exports.ProcessMediaDto = exports.JobPriority = exports.JobStatus = exports.ProcessingJobType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ProcessingJobType;
(function (ProcessingJobType) {
    ProcessingJobType["RESIZE"] = "RESIZE";
    ProcessingJobType["COMPRESS"] = "COMPRESS";
    ProcessingJobType["CONVERT"] = "CONVERT";
    ProcessingJobType["THUMBNAIL"] = "THUMBNAIL";
    ProcessingJobType["WATERMARK"] = "WATERMARK";
    ProcessingJobType["METADATA_EXTRACT"] = "METADATA_EXTRACT";
    ProcessingJobType["VIRUS_SCAN"] = "VIRUS_SCAN";
    ProcessingJobType["CONTENT_MODERATION"] = "CONTENT_MODERATION";
})(ProcessingJobType || (exports.ProcessingJobType = ProcessingJobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "PENDING";
    JobStatus["PROCESSING"] = "PROCESSING";
    JobStatus["COMPLETED"] = "COMPLETED";
    JobStatus["FAILED"] = "FAILED";
    JobStatus["CANCELLED"] = "CANCELLED";
    JobStatus["RETRYING"] = "RETRYING";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var JobPriority;
(function (JobPriority) {
    JobPriority["LOW"] = "LOW";
    JobPriority["NORMAL"] = "NORMAL";
    JobPriority["HIGH"] = "HIGH";
    JobPriority["URGENT"] = "URGENT";
})(JobPriority || (exports.JobPriority = JobPriority = {}));
class ProcessMediaDto {
    mediaId;
    type;
    priority;
    options;
}
exports.ProcessMediaDto = ProcessMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media ID to process' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessMediaDto.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing job type', enum: ProcessingJobType }),
    (0, class_validator_1.IsEnum)(ProcessingJobType),
    __metadata("design:type", String)
], ProcessMediaDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job priority', enum: JobPriority }),
    (0, class_validator_1.IsEnum)(JobPriority),
    __metadata("design:type", String)
], ProcessMediaDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Processing options' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ProcessMediaDto.prototype, "options", void 0);
class ProcessingJobResponseDto {
    id;
    mediaId;
    type;
    status;
    priority;
    options;
    progress;
    startedAt;
    completedAt;
    failedAt;
    retryCount;
    maxRetries;
    error;
    queueName;
    jobId;
    createdAt;
    updatedAt;
}
exports.ProcessingJobResponseDto = ProcessingJobResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job ID' }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media ID' }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job type', enum: ProcessingJobType }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job status', enum: JobStatus }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job priority', enum: JobPriority }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing options' }),
    __metadata("design:type", Object)
], ProcessingJobResponseDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job progress (0-100)' }),
    __metadata("design:type", Number)
], ProcessingJobResponseDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job start timestamp' }),
    __metadata("design:type", Date)
], ProcessingJobResponseDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job completion timestamp' }),
    __metadata("design:type", Date)
], ProcessingJobResponseDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job failure timestamp' }),
    __metadata("design:type", Date)
], ProcessingJobResponseDto.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Retry count' }),
    __metadata("design:type", Number)
], ProcessingJobResponseDto.prototype, "retryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum retries allowed' }),
    __metadata("design:type", Number)
], ProcessingJobResponseDto.prototype, "maxRetries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if failed' }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Queue name' }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "queueName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Queue job ID' }),
    __metadata("design:type", String)
], ProcessingJobResponseDto.prototype, "jobId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job creation timestamp' }),
    __metadata("design:type", Date)
], ProcessingJobResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job update timestamp' }),
    __metadata("design:type", Date)
], ProcessingJobResponseDto.prototype, "updatedAt", void 0);
class BatchProcessingDto {
    mediaIds;
    type;
    priority;
    options;
    sequential = false;
}
exports.BatchProcessingDto = BatchProcessingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media IDs to process' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BatchProcessingDto.prototype, "mediaIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing job type', enum: ProcessingJobType }),
    (0, class_validator_1.IsEnum)(ProcessingJobType),
    __metadata("design:type", String)
], BatchProcessingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job priority', enum: JobPriority }),
    (0, class_validator_1.IsEnum)(JobPriority),
    __metadata("design:type", String)
], BatchProcessingDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Processing options' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BatchProcessingDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Process sequentially', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BatchProcessingDto.prototype, "sequential", void 0);
class BatchProcessingResponseDto {
    message;
    jobs;
    successCount;
    failedCount;
    failures;
}
exports.BatchProcessingResponseDto = BatchProcessingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success message' }),
    __metadata("design:type", String)
], BatchProcessingResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created processing jobs', type: [ProcessingJobResponseDto] }),
    __metadata("design:type", Array)
], BatchProcessingResponseDto.prototype, "jobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successfully queued count' }),
    __metadata("design:type", Number)
], BatchProcessingResponseDto.prototype, "successCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed to queue count' }),
    __metadata("design:type", Number)
], BatchProcessingResponseDto.prototype, "failedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed media IDs with errors' }),
    __metadata("design:type", Array)
], BatchProcessingResponseDto.prototype, "failures", void 0);
class ProcessingStatsDto {
    totalJobs;
    pendingJobs;
    processingJobs;
    completedJobs;
    failedJobs;
    avgProcessingTime;
    successRate;
    jobsByType;
    jobsByPriority;
    queueSize;
    activeWorkers;
}
exports.ProcessingStatsDto = ProcessingStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total jobs count' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "totalJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending jobs count' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "pendingJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing jobs count' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "processingJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Completed jobs count' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "completedJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed jobs count' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "failedJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average processing time in seconds' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "avgProcessingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success rate percentage' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "successRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Jobs by type' }),
    __metadata("design:type", Object)
], ProcessingStatsDto.prototype, "jobsByType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Jobs by priority' }),
    __metadata("design:type", Object)
], ProcessingStatsDto.prototype, "jobsByPriority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current queue size' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "queueSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active workers count' }),
    __metadata("design:type", Number)
], ProcessingStatsDto.prototype, "activeWorkers", void 0);
//# sourceMappingURL=processing.dto.js.map