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
exports.AdminJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminJwtGuard = class AdminJwtGuard extends (0, passport_1.AuthGuard)('jwt') {
    jwtService;
    prisma;
    constructor(jwtService, prisma) {
        super();
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'admin') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const admin = await this.prisma.adminUser.findUnique({
                where: { id: payload.sub },
            });
            if (!admin || !admin.isActive || admin.isBlocked) {
                throw new common_1.UnauthorizedException('Admin account not found or inactive');
            }
            if (admin.sessionToken !== token ||
                (admin.sessionExpiresAt && admin.sessionExpiresAt < new Date())) {
                throw new common_1.UnauthorizedException('Session expired');
            }
            request.admin = {
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
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AdminJwtGuard = AdminJwtGuard;
exports.AdminJwtGuard = AdminJwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AdminJwtGuard);
//# sourceMappingURL=admin-jwt.guard.js.map