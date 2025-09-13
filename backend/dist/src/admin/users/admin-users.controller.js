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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const admin_users_service_1 = require("./admin-users.service");
const user_management_dto_1 = require("../dto/user-management.dto");
const admin_jwt_guard_1 = require("../guards/admin-jwt.guard");
const admin_roles_guard_1 = require("../guards/admin-roles.guard");
const admin_roles_decorator_1 = require("../decorators/admin-roles.decorator");
const get_admin_user_decorator_1 = require("../decorators/get-admin-user.decorator");
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
    AdminRole["SUPPORT"] = "SUPPORT";
    AdminRole["ANALYST"] = "ANALYST";
})(AdminRole || (AdminRole = {}));
let AdminUsersController = class AdminUsersController {
    adminUsersService;
    constructor(adminUsersService) {
        this.adminUsersService = adminUsersService;
    }
    async getUserStats() {
        return this.adminUsersService.getUserStats();
    }
    async getUsers(query) {
        return this.adminUsersService.getUsers(query);
    }
    async getUserById(userId) {
        return this.adminUsersService.getUserById(userId);
    }
    async updateUser(userId, updateDto, adminId) {
        await this.adminUsersService.updateUser(userId, updateDto, adminId);
        return { message: 'User updated successfully' };
    }
    async suspendUser(userId, suspendDto, adminId) {
        await this.adminUsersService.suspendUser(userId, suspendDto, adminId);
        return { message: 'User suspended successfully' };
    }
    async unsuspendUser(userId, adminId) {
        await this.adminUsersService.unsuspendUser(userId, adminId);
        return { message: 'User unsuspended successfully' };
    }
    async verifyUser(userId, verifyDto, adminId) {
        await this.adminUsersService.verifyUser(userId, verifyDto, adminId);
        return { message: 'User verification updated successfully' };
    }
    async addUserNote(userId, noteDto, adminId) {
        await this.adminUsersService.addUserNote(userId, noteDto, adminId);
        return { message: 'Note added successfully' };
    }
    async getUserActivity(userId, page, limit) {
        return this.adminUsersService.getUserActivity(userId, page, limit);
    }
    async bulkUserAction(actionDto, adminId) {
        await this.adminUsersService.bulkUserAction(actionDto, adminId);
        return { message: `Bulk action ${actionDto.action} completed successfully on ${actionDto.userIds.length} users` };
    }
    async reportUser(reportDto, reporterId) {
        await this.adminUsersService.reportUser(reportDto, reporterId);
        return { message: 'User report submitted successfully' };
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.ANALYST),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_management_dto_1.AdminUserQueryDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.AdminUserUpdateDto, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.AdminUserSuspendDto, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Post)(':id/unsuspend'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "unsuspendUser", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.AdminUserVerifyDto, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "verifyUser", null);
__decorate([
    (0, common_1.Post)(':id/note'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.AdminUserNoteDto, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "addUserNote", null);
__decorate([
    (0, common_1.Get)(':id/activity'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserActivity", null);
__decorate([
    (0, common_1.Post)('bulk-action'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_management_dto_1.AdminBulkUserActionDto, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "bulkUserAction", null);
__decorate([
    (0, common_1.Post)('report'),
    (0, admin_roles_decorator_1.AdminRoles)(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT),
    (0, common_1.UseGuards)(admin_roles_guard_1.AdminRolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_admin_user_decorator_1.GetAdminUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_management_dto_1.AdminUserReportDto, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "reportUser", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [admin_users_service_1.AdminUsersService])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map