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
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const argon2 = __importStar(require("argon2"));
const speakeasy = __importStar(require("speakeasy"));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
    AdminRole["SUPPORT"] = "SUPPORT";
    AdminRole["ANALYST"] = "ANALYST";
})(AdminRole || (AdminRole = {}));
let AdminAuthService = class AdminAuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto, req) {
        const { email, password, twoFactorCode } = loginDto;
        const clientIp = this.getClientIp(req);
        const admin = await this.prisma.adminUser.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!admin.isActive || admin.isBlocked) {
            throw new common_1.ForbiddenException('Account is inactive or blocked');
        }
        if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            throw new common_1.ForbiddenException('Account is temporarily locked');
        }
        const isPasswordValid = await argon2.verify(admin.passwordHash, password);
        if (!isPasswordValid) {
            await this.handleFailedLogin(admin.id);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (admin.ipWhitelist.length > 0 && !admin.ipWhitelist.includes(clientIp)) {
            throw new common_1.ForbiddenException('IP address not whitelisted');
        }
        if (admin.twoFactorEnabled) {
            if (!twoFactorCode) {
                return {
                    admin: null,
                    token: null,
                    refreshToken: null,
                    expiresIn: 0,
                    requiresTwoFactor: true,
                };
            }
            const isValidTwoFactor = speakeasy.totp.verify({
                secret: admin.twoFactorSecret || '',
                encoding: 'base32',
                token: twoFactorCode,
                window: 1,
            });
            if (!isValidTwoFactor) {
                throw new common_1.UnauthorizedException('Invalid two-factor authentication code');
            }
        }
        const tokens = await this.generateTokens(admin.id, admin.role);
        await this.prisma.adminUser.update({
            where: { id: admin.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: clientIp,
                loginAttempts: 0,
                lockedUntil: null,
                sessionToken: tokens.token,
                sessionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        await this.logAdminAction(admin.id, 'ADMIN_LOGIN', 'AdminUser', admin.id, `Admin logged in from ${clientIp}`);
        const adminProfile = this.formatAdminProfile(admin);
        return {
            admin: adminProfile,
            token: tokens.token,
            refreshToken: tokens.refreshToken,
            expiresIn: 24 * 60 * 60,
        };
    }
    async createAdmin(createDto, createdById) {
        const { email, password, ...adminData } = createDto;
        const existingAdmin = await this.prisma.adminUser.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingAdmin) {
            throw new common_1.ConflictException('Admin with this email already exists');
        }
        const creator = await this.prisma.adminUser.findUnique({
            where: { id: createdById },
        });
        if (!creator || creator.role !== AdminRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admins can create new admin accounts');
        }
        const passwordHash = await argon2.hash(password);
        const admin = await this.prisma.adminUser.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                createdById,
                ...adminData,
            },
        });
        await this.logAdminAction(createdById, 'ADMIN_CREATED', 'AdminUser', admin.id, `Admin ${admin.email} created`);
        return this.formatAdminProfile(admin);
    }
    async setupTwoFactor(adminId) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { id: adminId },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Admin not found');
        }
        const secret = speakeasy.generateSecret({
            name: `TradeByBarter Admin (${admin.email})`,
            issuer: 'TradeByBarter',
        });
        await this.prisma.adminUser.update({
            where: { id: adminId },
            data: { twoFactorSecret: secret.base32 },
        });
        return {
            secret: secret.base32,
            qrCode: secret.otpauth_url || '',
        };
    }
    async enableTwoFactor(adminId, twoFactorDto) {
        const { secret, code } = twoFactorDto;
        const isValid = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
            window: 1,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid two-factor authentication code');
        }
        const backupCodes = this.generateBackupCodes();
        await this.prisma.adminUser.update({
            where: { id: adminId },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret,
                twoFactorBackupCodes: backupCodes,
            },
        });
        await this.logAdminAction(adminId, 'TWO_FACTOR_ENABLED', 'AdminUser', adminId, 'Two-factor authentication enabled');
        return { backupCodes };
    }
    async disableTwoFactor(adminId) {
        await this.prisma.adminUser.update({
            where: { id: adminId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: [],
            },
        });
        await this.logAdminAction(adminId, 'TWO_FACTOR_DISABLED', 'AdminUser', adminId, 'Two-factor authentication disabled');
    }
    async changePassword(adminId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const admin = await this.prisma.adminUser.findUnique({
            where: { id: adminId },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Admin not found');
        }
        const isCurrentPasswordValid = await argon2.verify(admin.passwordHash, currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const newPasswordHash = await argon2.hash(newPassword);
        await this.prisma.adminUser.update({
            where: { id: adminId },
            data: {
                passwordHash: newPasswordHash,
                passwordChangedAt: new Date(),
            },
        });
        await this.logAdminAction(adminId, 'PASSWORD_CHANGED', 'AdminUser', adminId, 'Admin password changed');
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const admin = await this.prisma.adminUser.findUnique({
                where: { id: payload.sub },
            });
            if (!admin || !admin.isActive || admin.isBlocked) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            return this.formatAdminProfile(admin);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async logout(adminId) {
        await this.prisma.adminUser.update({
            where: { id: adminId },
            data: {
                sessionToken: null,
                sessionExpiresAt: null,
            },
        });
        await this.logAdminAction(adminId, 'ADMIN_LOGOUT', 'AdminUser', adminId, 'Admin logged out');
    }
    async generateTokens(adminId, role) {
        const payload = { sub: adminId, role, type: 'admin' };
        const token = this.jwtService.sign(payload, { expiresIn: '24h' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        return { token, refreshToken };
    }
    async handleFailedLogin(adminId) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { id: adminId },
        });
        if (!admin)
            return;
        const newAttempts = admin.loginAttempts + 1;
        const updateData = { loginAttempts: newAttempts };
        if (newAttempts >= 5) {
            updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            updateData.loginAttempts = 0;
        }
        await this.prisma.adminUser.update({
            where: { id: adminId },
            data: updateData,
        });
    }
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push(code);
        }
        return codes;
    }
    getClientIp(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1';
    }
    formatAdminProfile(admin) {
        return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            firstName: admin.firstName,
            lastName: admin.lastName,
            phoneNumber: admin.phoneNumber,
            role: admin.role,
            isActive: admin.isActive,
            twoFactorEnabled: admin.twoFactorEnabled,
            lastLoginAt: admin.lastLoginAt,
            lastLoginIp: admin.lastLoginIp,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
        };
    }
    async logAdminAction(adminId, action, targetType, targetId, description) {
        await this.prisma.adminAuditLog.create({
            data: {
                adminId,
                action: action,
                targetType: targetType,
                targetId,
                description,
                severity: 'MEDIUM',
            },
        });
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map