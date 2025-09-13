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
exports.AdminLoginResponseDto = exports.AdminListResponseDto = exports.AdminProfileResponseDto = exports.AdminSessionDto = exports.AdminTwoFactorDto = exports.AdminChangePasswordDto = exports.AdminUpdateDto = exports.AdminCreateDto = exports.AdminLoginDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class AdminLoginDto {
    email;
    password;
    twoFactorCode;
}
exports.AdminLoginDto = AdminLoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "twoFactorCode", void 0);
class AdminCreateDto {
    email;
    password;
    name;
    firstName;
    lastName;
    phoneNumber;
    role;
    ipWhitelist;
}
exports.AdminCreateDto = AdminCreateDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AdminRole),
    __metadata("design:type", String)
], AdminCreateDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AdminCreateDto.prototype, "ipWhitelist", void 0);
class AdminUpdateDto {
    name;
    firstName;
    lastName;
    phoneNumber;
    role;
    isActive;
    ipWhitelist;
}
exports.AdminUpdateDto = AdminUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AdminRole),
    __metadata("design:type", String)
], AdminUpdateDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUpdateDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AdminUpdateDto.prototype, "ipWhitelist", void 0);
class AdminChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.AdminChangePasswordDto = AdminChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], AdminChangePasswordDto.prototype, "newPassword", void 0);
class AdminTwoFactorDto {
    secret;
    code;
}
exports.AdminTwoFactorDto = AdminTwoFactorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTwoFactorDto.prototype, "secret", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTwoFactorDto.prototype, "code", void 0);
class AdminSessionDto {
    token;
    refreshToken;
}
exports.AdminSessionDto = AdminSessionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminSessionDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminSessionDto.prototype, "refreshToken", void 0);
class AdminProfileResponseDto {
    id;
    email;
    name;
    firstName;
    lastName;
    phoneNumber;
    role;
    isActive;
    twoFactorEnabled;
    lastLoginAt;
    lastLoginIp;
    createdAt;
    updatedAt;
}
exports.AdminProfileResponseDto = AdminProfileResponseDto;
class AdminListResponseDto {
    id;
    email;
    name;
    role;
    isActive;
    isBlocked;
    lastLoginAt;
    createdAt;
    createdBy;
}
exports.AdminListResponseDto = AdminListResponseDto;
class AdminLoginResponseDto {
    admin;
    token;
    refreshToken;
    expiresIn;
    requiresTwoFactor;
}
exports.AdminLoginResponseDto = AdminLoginResponseDto;
//# sourceMappingURL=admin-auth.dto.js.map