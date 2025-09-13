import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto, AdminCreateDto, AdminChangePasswordDto, AdminTwoFactorDto, AdminLoginResponseDto, AdminProfileResponseDto } from '../dto/admin-auth.dto';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import { Request } from 'express';

// Define AdminRole enum locally
enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  ANALYST = 'ANALYST',
}

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: AdminLoginDto, req: Request): Promise<AdminLoginResponseDto> {
    const { email, password, twoFactorCode } = loginDto;
    const clientIp = this.getClientIp(req);

    // Find admin user
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive || admin.isBlocked) {
      throw new ForbiddenException('Account is inactive or blocked');
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(admin.passwordHash, password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(admin.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check IP whitelist if configured
    if (admin.ipWhitelist.length > 0 && !admin.ipWhitelist.includes(clientIp)) {
      throw new ForbiddenException('IP address not whitelisted');
    }

    // Check two-factor authentication
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
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(admin.id, admin.role);

    // Update login information
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
        loginAttempts: 0,
        lockedUntil: null,
        sessionToken: tokens.token,
        sessionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Log admin login
    await this.logAdminAction(admin.id, 'ADMIN_LOGIN', 'AdminUser', admin.id, `Admin logged in from ${clientIp}`);

    const adminProfile = this.formatAdminProfile(admin);

    return {
      admin: adminProfile,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  async createAdmin(createDto: AdminCreateDto, createdById: string): Promise<AdminProfileResponseDto> {
    const { email, password, ...adminData } = createDto;

    // Check if email already exists
    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Only SUPER_ADMIN can create other admins
    const creator = await this.prisma.adminUser.findUnique({
      where: { id: createdById },
    });

    if (!creator || creator.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create new admin accounts');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create admin
    const admin = await this.prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        createdById,
        ...adminData,
      },
    });

    // Log admin creation
    await this.logAdminAction(createdById, 'ADMIN_CREATED', 'AdminUser', admin.id, `Admin ${admin.email} created`);

    return this.formatAdminProfile(admin);
  }

  async setupTwoFactor(adminId: string): Promise<{ secret: string; qrCode: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const secret = speakeasy.generateSecret({
      name: `TradeByBarter Admin (${admin.email})`,
      issuer: 'TradeByBarter',
    });

    // Store the secret temporarily (will be activated after verification)
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { twoFactorSecret: secret.base32 },
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
    };
  }

  async enableTwoFactor(adminId: string, twoFactorDto: AdminTwoFactorDto): Promise<{ backupCodes: string[] }> {
    const { secret, code } = twoFactorDto;

    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid two-factor authentication code');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Enable two-factor authentication
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
      },
    });

    // Log two-factor setup
    await this.logAdminAction(adminId, 'TWO_FACTOR_ENABLED', 'AdminUser', adminId, 'Two-factor authentication enabled');

    return { backupCodes };
  }

  async disableTwoFactor(adminId: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    // Log two-factor disable
    await this.logAdminAction(adminId, 'TWO_FACTOR_DISABLED', 'AdminUser', adminId, 'Two-factor authentication disabled');
  }

  async changePassword(adminId: string, changePasswordDto: AdminChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(admin.passwordHash, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(newPassword);

    // Update password
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
      },
    });

    // Log password change
    await this.logAdminAction(adminId, 'PASSWORD_CHANGED', 'AdminUser', adminId, 'Admin password changed');
  }

  async validateToken(token: string): Promise<AdminProfileResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });

      if (!admin || !admin.isActive || admin.isBlocked) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.formatAdminProfile(admin);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logout(adminId: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        sessionToken: null,
        sessionExpiresAt: null,
      },
    });

    // Log admin logout
    await this.logAdminAction(adminId, 'ADMIN_LOGOUT', 'AdminUser', adminId, 'Admin logged out');
  }

  private async generateTokens(adminId: string, role: any): Promise<{ token: string; refreshToken: string }> {
    const payload = { sub: adminId, role, type: 'admin' };

    const token = this.jwtService.sign(payload, { expiresIn: '24h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { token, refreshToken };
  }

  private async handleFailedLogin(adminId: string): Promise<void> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!admin) return;

    const newAttempts = admin.loginAttempts + 1;
    const updateData: any = { loginAttempts: newAttempts };

    // Lock account after 5 failed attempts for 30 minutes
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      updateData.loginAttempts = 0;
    }

    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: updateData,
    });
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private getClientIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           '127.0.0.1';
  }

  private formatAdminProfile(admin: any): AdminProfileResponseDto {
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

  private async logAdminAction(adminId: string, action: string, targetType: string, targetId: string, description: string): Promise<void> {
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: action as any,
        targetType: targetType as any,
        targetId,
        description,
        severity: 'MEDIUM',
      },
    });
  }
}