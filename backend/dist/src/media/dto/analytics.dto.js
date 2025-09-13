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
exports.SystemHealthDto = exports.UserStorageAnalyticsDto = exports.MediaAnalyticsResponseDto = exports.AnalyticsDataPointDto = exports.GetAnalyticsDto = exports.MediaType = exports.AnalyticsTimeframe = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var AnalyticsTimeframe;
(function (AnalyticsTimeframe) {
    AnalyticsTimeframe["HOUR"] = "HOUR";
    AnalyticsTimeframe["DAY"] = "DAY";
    AnalyticsTimeframe["WEEK"] = "WEEK";
    AnalyticsTimeframe["MONTH"] = "MONTH";
    AnalyticsTimeframe["YEAR"] = "YEAR";
})(AnalyticsTimeframe || (exports.AnalyticsTimeframe = AnalyticsTimeframe = {}));
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "IMAGE";
    MediaType["VIDEO"] = "VIDEO";
    MediaType["AUDIO"] = "AUDIO";
    MediaType["DOCUMENT"] = "DOCUMENT";
})(MediaType || (exports.MediaType = MediaType = {}));
class GetAnalyticsDto {
    startDate;
    endDate;
    timeframe = AnalyticsTimeframe.DAY;
    mediaType;
    provider;
    region;
}
exports.GetAnalyticsDto = GetAnalyticsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for analytics', example: '2024-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for analytics', example: '2024-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Analytics timeframe', enum: AnalyticsTimeframe }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AnalyticsTimeframe),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "timeframe", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media type filter', enum: MediaType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MediaType),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Storage provider filter' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Region filter' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "region", void 0);
class AnalyticsDataPointDto {
    date;
    totalUploads;
    successfulUploads;
    failedUploads;
    totalStorageUsed;
    storageByProvider;
    storageByRegion;
    totalProcessingJobs;
    successfulJobs;
    failedJobs;
    avgProcessingTime;
    imageUploads;
    videoUploads;
    audioUploads;
    documentUploads;
    lagosUploads;
    abujaUploads;
    portHarcourtUploads;
    otherRegionUploads;
}
exports.AnalyticsDataPointDto = AnalyticsDataPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date for this data point' }),
    __metadata("design:type", Date)
], AnalyticsDataPointDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "totalUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successful uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "successfulUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "failedUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total storage used in bytes' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "totalStorageUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage usage by provider' }),
    __metadata("design:type", Object)
], AnalyticsDataPointDto.prototype, "storageByProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage usage by region' }),
    __metadata("design:type", Object)
], AnalyticsDataPointDto.prototype, "storageByRegion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total processing jobs' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "totalProcessingJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successful processing jobs' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "successfulJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed processing jobs' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "failedJobs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average processing time in milliseconds' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "avgProcessingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image uploads count' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "imageUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Video uploads count' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "videoUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Audio uploads count' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "audioUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document uploads count' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "documentUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lagos region uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "lagosUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Abuja region uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "abujaUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Port Harcourt region uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "portHarcourtUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Other regions uploads' }),
    __metadata("design:type", Number)
], AnalyticsDataPointDto.prototype, "otherRegionUploads", void 0);
class MediaAnalyticsResponseDto {
    summary;
    timeSeries;
    uploadTrends;
    processingPerformance;
    storageInsights;
    nigerianOptimization;
}
exports.MediaAnalyticsResponseDto = MediaAnalyticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Analytics summary' }),
    __metadata("design:type", Object)
], MediaAnalyticsResponseDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time series data', type: [AnalyticsDataPointDto] }),
    __metadata("design:type", Array)
], MediaAnalyticsResponseDto.prototype, "timeSeries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload trends' }),
    __metadata("design:type", Object)
], MediaAnalyticsResponseDto.prototype, "uploadTrends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing performance' }),
    __metadata("design:type", Object)
], MediaAnalyticsResponseDto.prototype, "processingPerformance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage insights' }),
    __metadata("design:type", Object)
], MediaAnalyticsResponseDto.prototype, "storageInsights", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nigerian network optimization insights' }),
    __metadata("design:type", Object)
], MediaAnalyticsResponseDto.prototype, "nigerianOptimization", void 0);
class UserStorageAnalyticsDto {
    userId;
    totalUsed;
    quota;
    usagePercentage;
    filesByType;
    storageByCategory;
    uploadActivity;
    qualityPreferences;
    regionalActivity;
}
exports.UserStorageAnalyticsDto = UserStorageAnalyticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], UserStorageAnalyticsDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total storage used in bytes' }),
    __metadata("design:type", Number)
], UserStorageAnalyticsDto.prototype, "totalUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage quota in bytes' }),
    __metadata("design:type", Number)
], UserStorageAnalyticsDto.prototype, "quota", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Usage percentage' }),
    __metadata("design:type", Number)
], UserStorageAnalyticsDto.prototype, "usagePercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File count by type' }),
    __metadata("design:type", Object)
], UserStorageAnalyticsDto.prototype, "filesByType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage by category' }),
    __metadata("design:type", Object)
], UserStorageAnalyticsDto.prototype, "storageByCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload activity' }),
    __metadata("design:type", Object)
], UserStorageAnalyticsDto.prototype, "uploadActivity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quality preferences' }),
    __metadata("design:type", Object)
], UserStorageAnalyticsDto.prototype, "qualityPreferences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Regional activity' }),
    __metadata("design:type", Object)
], UserStorageAnalyticsDto.prototype, "regionalActivity", void 0);
class SystemHealthDto {
    healthScore;
    storage;
    processing;
    api;
    database;
    regionalHealth;
    recommendations;
}
exports.SystemHealthDto = SystemHealthDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall system health score (0-100)' }),
    __metadata("design:type", Number)
], SystemHealthDto.prototype, "healthScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Storage health' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "storage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing queue health' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "processing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'API performance' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "api", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Database performance' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "database", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Regional performance by Nigerian cities' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "regionalHealth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recommendations for improvement' }),
    __metadata("design:type", Array)
], SystemHealthDto.prototype, "recommendations", void 0);
//# sourceMappingURL=analytics.dto.js.map