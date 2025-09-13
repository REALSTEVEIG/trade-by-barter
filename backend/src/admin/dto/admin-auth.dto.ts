import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { AdminRole } from '@prisma/client';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}

export class AdminCreateDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(AdminRole)
  role: AdminRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];
}

export class AdminUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];
}

export class AdminChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class AdminTwoFactorDto {
  @IsString()
  secret: string;

  @IsString()
  code: string;
}

export class AdminSessionDto {
  @IsString()
  token: string;

  @IsString()
  refreshToken: string;
}

export class AdminProfileResponseDto {
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

export class AdminListResponseDto {
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

export class AdminLoginResponseDto {
  admin: AdminProfileResponseDto | null;
  token: string | null;
  refreshToken: string | null;
  expiresIn: number;
  requiresTwoFactor?: boolean;
}