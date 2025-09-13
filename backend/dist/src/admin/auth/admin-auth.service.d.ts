import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto, AdminCreateDto, AdminChangePasswordDto, AdminTwoFactorDto, AdminLoginResponseDto, AdminProfileResponseDto } from '../dto/admin-auth.dto';
import { Request } from 'express';
export declare class AdminAuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: AdminLoginDto, req: Request): Promise<AdminLoginResponseDto>;
    createAdmin(createDto: AdminCreateDto, createdById: string): Promise<AdminProfileResponseDto>;
    setupTwoFactor(adminId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    enableTwoFactor(adminId: string, twoFactorDto: AdminTwoFactorDto): Promise<{
        backupCodes: string[];
    }>;
    disableTwoFactor(adminId: string): Promise<void>;
    changePassword(adminId: string, changePasswordDto: AdminChangePasswordDto): Promise<void>;
    validateToken(token: string): Promise<AdminProfileResponseDto>;
    logout(adminId: string): Promise<void>;
    private generateTokens;
    private handleFailedLogin;
    private generateBackupCodes;
    private getClientIp;
    private formatAdminProfile;
    private logAdminAction;
}
