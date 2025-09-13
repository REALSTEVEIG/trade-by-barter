import { Controller, Post, Body, UseGuards, Request, Get, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminCreateDto, AdminChangePasswordDto, AdminTwoFactorDto, AdminLoginResponseDto, AdminProfileResponseDto } from '../dto/admin-auth.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import { GetAdminUser } from '../decorators/get-admin-user.decorator';

// Define AdminRole enum locally
enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  ANALYST = 'ANALYST',
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AdminLoginDto,
    @Request() req: any,
  ): Promise<AdminLoginResponseDto> {
    return this.adminAuthService.login(loginDto, req);
  }

  @Post('create')
  @UseGuards(AdminJwtGuard, AdminRolesGuard)
  @AdminRoles(AdminRole.SUPER_ADMIN)
  async createAdmin(
    @Body() createDto: AdminCreateDto,
    @GetAdminUser('id') adminId: string,
  ): Promise<AdminProfileResponseDto> {
    return this.adminAuthService.createAdmin(createDto, adminId);
  }

  @Get('profile')
  @UseGuards(AdminJwtGuard)
  async getProfile(@GetAdminUser() admin: AdminProfileResponseDto): Promise<AdminProfileResponseDto> {
    return admin;
  }

  @Post('change-password')
  @UseGuards(AdminJwtGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordDto: AdminChangePasswordDto,
    @GetAdminUser('id') adminId: string,
  ): Promise<{ message: string }> {
    await this.adminAuthService.changePassword(adminId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('setup-2fa')
  @UseGuards(AdminJwtGuard)
  async setupTwoFactor(
    @GetAdminUser('id') adminId: string,
  ): Promise<{ secret: string; qrCode: string }> {
    return this.adminAuthService.setupTwoFactor(adminId);
  }

  @Post('enable-2fa')
  @UseGuards(AdminJwtGuard)
  async enableTwoFactor(
    @Body() twoFactorDto: AdminTwoFactorDto,
    @GetAdminUser('id') adminId: string,
  ): Promise<{ backupCodes: string[]; message: string }> {
    const result = await this.adminAuthService.enableTwoFactor(adminId, twoFactorDto);
    return {
      ...result,
      message: 'Two-factor authentication enabled successfully',
    };
  }

  @Post('disable-2fa')
  @UseGuards(AdminJwtGuard)
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(
    @GetAdminUser('id') adminId: string,
  ): Promise<{ message: string }> {
    await this.adminAuthService.disableTwoFactor(adminId);
    return { message: 'Two-factor authentication disabled successfully' };
  }

  @Post('logout')
  @UseGuards(AdminJwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetAdminUser('id') adminId: string): Promise<{ message: string }> {
    await this.adminAuthService.logout(adminId);
    return { message: 'Logged out successfully' };
  }

  @Get('verify-token')
  @UseGuards(AdminJwtGuard)
  async verifyToken(@GetAdminUser() admin: AdminProfileResponseDto): Promise<{
    valid: boolean;
    admin: AdminProfileResponseDto;
  }> {
    return {
      valid: true,
      admin,
    };
  }
}