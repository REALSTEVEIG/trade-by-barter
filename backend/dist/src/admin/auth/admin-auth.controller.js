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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const common_1 = require("@nestjs/common");
const admin_auth_service_1 = require("./admin-auth.service");
const admin_auth_dto_1 = require("../dto/admin-auth.dto");
const admin_jwt_guard_1 = require("../guards/admin-jwt.guard");
const admin_roles_decorator_1 = require("../decorators/admin-roles.decorator");
const admin_roles_guard_1 = require("../guards/admin-roles.guard");
const get_admin_user_decorator_1 = require("../decorators/get-admin-user.decorator");
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
    AdminRole["SUPPORT"] = "SUPPORT";
    AdminRole["ANALYST"] = "ANALYST";
})(AdminRole || (AdminRole = {}));
let AdminAuthController = class AdminAuthController {
    adminAuthService;
    constructor(adminAuthService) {
        this.adminAuthService = adminAuthService;
    }
    async login(loginDto, req) {
        return this.adminAuthService.login(loginDto, req);
    }
    async createAdmin(createDto, adminId) {
        return this.adminAuthService.createAdmin(createDto, adminId);
    }
    async getProfile(admin) {
        return admin;
    }
    async changePassword(changePasswordDto, adminId) {
        await this.adminAuthService.changePassword(adminId, changePasswordDto);
        return { message: 'Password changed successfully' };
    }
    async setupTwoFactor(adminId) {
        return this.adminAuthService.setupTwoFactor(adminId);
    }
    async enableTwoFactor(twoFactorDto, adminId) {
        const result = await this.adminAuthService.enableTwoFactor(adminId, twoFactorDto);
        return {
            ...result,
            message: 'Two-factor authentication enabled successfully',
        };
    }
    async disableTwoFactor(adminId) {
        await this.adminAuthService.disableTwoFactor(adminId);
        return { message: 'Two-factor authentication disabled successfully' };
    }
    async logout(adminId) {
        await this.adminAuthService.logout(adminId);
        return { message: 'Logged out successfully' };
    }
    async verifyToken(admin) {
        return {
            valid: true,
            admin,
        };
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_auth_dto_1.AdminLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard, admin_roles_guard_1.AdminRolesGuard),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_auth_dto_1.AdminCreateDto, String]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __param(0, (0, get_admin_user_decorator_1.GetAdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_auth_dto_1.AdminProfileResponseDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_auth_dto_1.AdminChangePasswordDto, String]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('setup-2fa'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __param(0, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "setupTwoFactor", null);
__decorate([
    (0, common_1.Post)('enable-2fa'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_auth_dto_1.AdminTwoFactorDto, String]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "enableTwoFactor", null);
__decorate([
    (0, common_1.Post)('disable-2fa'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "disableTwoFactor", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('verify-token'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __param(0, (0, get_admin_user_decorator_1.GetAdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_auth_dto_1.AdminProfileResponseDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "verifyToken", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, common_1.Controller)('admin/auth'),
    __metadata("design:paramtypes", [admin_auth_service_1.AdminAuthService])
], AdminAuthController);
//# sourceMappingURL=admin-auth.controller.js.map