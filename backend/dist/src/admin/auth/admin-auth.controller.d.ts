import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminCreateDto, AdminChangePasswordDto, AdminTwoFactorDto, AdminLoginResponseDto, AdminProfileResponseDto } from '../dto/admin-auth.dto';
export declare class AdminAuthController {
    private readonly adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    login(loginDto: AdminLoginDto, req: any): Promise<AdminLoginResponseDto>;
    createAdmin(createDto: AdminCreateDto, adminId: string): Promise<AdminProfileResponseDto>;
    getProfile(admin: AdminProfileResponseDto): Promise<AdminProfileResponseDto>;
    changePassword(changePasswordDto: AdminChangePasswordDto, adminId: string): Promise<{
        message: string;
    }>;
    setupTwoFactor(adminId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    enableTwoFactor(twoFactorDto: AdminTwoFactorDto, adminId: string): Promise<{
        backupCodes: string[];
        message: string;
    }>;
    disableTwoFactor(adminId: string): Promise<{
        message: string;
    }>;
    logout(adminId: string): Promise<{
        message: string;
    }>;
    verifyToken(admin: AdminProfileResponseDto): Promise<{
        valid: boolean;
        admin: AdminProfileResponseDto;
    }>;
}
