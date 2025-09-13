import { AdminRole } from '@prisma/client';
export declare class AdminLoginDto {
    email: string;
    password: string;
    twoFactorCode?: string;
}
export declare class AdminCreateDto {
    email: string;
    password: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: AdminRole;
    ipWhitelist?: string[];
}
export declare class AdminUpdateDto {
    name?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: AdminRole;
    isActive?: boolean;
    ipWhitelist?: string[];
}
export declare class AdminChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AdminTwoFactorDto {
    secret: string;
    code: string;
}
export declare class AdminSessionDto {
    token: string;
    refreshToken: string;
}
export declare class AdminProfileResponseDto {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: AdminRole;
    isActive: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AdminListResponseDto {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    isActive: boolean;
    isBlocked: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
}
export declare class AdminLoginResponseDto {
    admin: AdminProfileResponseDto | null;
    token: string | null;
    refreshToken: string | null;
    expiresIn: number;
    requiresTwoFactor?: boolean;
}
