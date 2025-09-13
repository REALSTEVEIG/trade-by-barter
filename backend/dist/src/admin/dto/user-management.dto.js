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
exports.AdminUserReportDto = exports.AdminBulkUserActionDto = exports.AdminUserActivityItemDto = exports.AdminUserActivityDto = exports.AdminUserListDto = exports.AdminModerationNoteDto = exports.AdminUserDetailDto = exports.AdminUserStatsDto = exports.AdminUserNoteDto = exports.AdminUserVerifyDto = exports.AdminUserSuspendDto = exports.AdminUserUpdateDto = exports.AdminUserQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AdminUserQueryDto {
    search;
    city;
    state;
    isActive;
    isBlocked;
    isVerified;
    page = 1;
    limit = 20;
    sortBy = 'createdAt';
    sortOrder = 'desc';
}
exports.AdminUserQueryDto = AdminUserQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserQueryDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserQueryDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], AdminUserQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], AdminUserQueryDto.prototype, "isBlocked", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], AdminUserQueryDto.prototype, "isVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], AdminUserQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], AdminUserQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], AdminUserQueryDto.prototype, "sortOrder", void 0);
class AdminUserUpdateDto {
    isActive;
    isBlocked;
    blockReason;
}
exports.AdminUserUpdateDto = AdminUserUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUserUpdateDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUserUpdateDto.prototype, "isBlocked", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserUpdateDto.prototype, "blockReason", void 0);
class AdminUserSuspendDto {
    reason;
    duration;
    notes;
}
exports.AdminUserSuspendDto = AdminUserSuspendDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserSuspendDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserSuspendDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserSuspendDto.prototype, "notes", void 0);
class AdminUserVerifyDto {
    isPhoneVerified;
    isEmailVerified;
    verificationNotes;
}
exports.AdminUserVerifyDto = AdminUserVerifyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUserVerifyDto.prototype, "isPhoneVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUserVerifyDto.prototype, "isEmailVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserVerifyDto.prototype, "verificationNotes", void 0);
class AdminUserNoteDto {
    note;
    severity = 'MEDIUM';
}
exports.AdminUserNoteDto = AdminUserNoteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserNoteDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    __metadata("design:type", String)
], AdminUserNoteDto.prototype, "severity", void 0);
class AdminUserStatsDto {
    totalUsers;
    activeUsers;
    blockedUsers;
    verifiedUsers;
    newUsersToday;
    newUsersThisWeek;
    newUsersThisMonth;
    topCities;
    topStates;
}
exports.AdminUserStatsDto = AdminUserStatsDto;
class AdminUserDetailDto {
    id;
    email;
    phoneNumber;
    firstName;
    lastName;
    displayName;
    profileImageUrl;
    isPhoneVerified;
    isEmailVerified;
    city;
    state;
    address;
    dateOfBirth;
    isActive;
    isBlocked;
    lastActiveAt;
    createdAt;
    updatedAt;
    totalListings;
    activeListings;
    totalOffers;
    completedTrades;
    averageRating;
    walletBalance;
    reportsMade;
    reportsReceived;
    moderationNotes;
}
exports.AdminUserDetailDto = AdminUserDetailDto;
class AdminModerationNoteDto {
    id;
    note;
    severity;
    createdAt;
    createdBy;
}
exports.AdminModerationNoteDto = AdminModerationNoteDto;
class AdminUserListDto {
    id;
    email;
    phoneNumber;
    firstName;
    lastName;
    city;
    state;
    isActive;
    isBlocked;
    isPhoneVerified;
    isEmailVerified;
    lastActiveAt;
    createdAt;
    totalListings;
    completedTrades;
    walletBalance;
}
exports.AdminUserListDto = AdminUserListDto;
class AdminUserActivityDto {
    userId;
    activities;
    pagination;
}
exports.AdminUserActivityDto = AdminUserActivityDto;
class AdminUserActivityItemDto {
    id;
    type;
    description;
    details;
    createdAt;
    ipAddress;
    userAgent;
}
exports.AdminUserActivityItemDto = AdminUserActivityItemDto;
class AdminBulkUserActionDto {
    userIds;
    action;
    reason;
    notes;
}
exports.AdminBulkUserActionDto = AdminBulkUserActionDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AdminBulkUserActionDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['activate', 'deactivate', 'block', 'unblock', 'verify_email', 'verify_phone']),
    __metadata("design:type", String)
], AdminBulkUserActionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBulkUserActionDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBulkUserActionDto.prototype, "notes", void 0);
class AdminUserReportDto {
    reportedUserId;
    reportType;
    reason;
    details;
    evidence;
}
exports.AdminUserReportDto = AdminUserReportDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminUserReportDto.prototype, "reportedUserId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['HARASSMENT', 'SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'SCAM', 'PAYMENT_DISPUTE', 'TERMS_VIOLATION', 'OTHER']),
    __metadata("design:type", String)
], AdminUserReportDto.prototype, "reportType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserReportDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUserReportDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AdminUserReportDto.prototype, "evidence", void 0);
//# sourceMappingURL=user-management.dto.js.map