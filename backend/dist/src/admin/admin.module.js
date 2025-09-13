"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const prisma_module_1 = require("../prisma/prisma.module");
const admin_auth_service_1 = require("./auth/admin-auth.service");
const admin_auth_controller_1 = require("./auth/admin-auth.controller");
const admin_jwt_guard_1 = require("./guards/admin-jwt.guard");
const admin_roles_guard_1 = require("./guards/admin-roles.guard");
const admin_users_service_1 = require("./users/admin-users.service");
const admin_users_controller_1 = require("./users/admin-users.controller");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'admin-jwt-secret',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [
            admin_auth_controller_1.AdminAuthController,
            admin_users_controller_1.AdminUsersController,
        ],
        providers: [
            admin_auth_service_1.AdminAuthService,
            admin_users_service_1.AdminUsersService,
            admin_jwt_guard_1.AdminJwtGuard,
            admin_roles_guard_1.AdminRolesGuard,
        ],
        exports: [
            admin_auth_service_1.AdminAuthService,
            admin_users_service_1.AdminUsersService,
            admin_jwt_guard_1.AdminJwtGuard,
            admin_roles_guard_1.AdminRolesGuard,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map