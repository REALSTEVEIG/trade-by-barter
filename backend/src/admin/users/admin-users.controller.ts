import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { 
  AdminUserQueryDto, 
  AdminUserUpdateDto, 
  AdminUserSuspendDto,
  AdminUserVerifyDto,
  AdminUserNoteDto,
  AdminBulkUserActionDto,
  AdminUserReportDto
} from '../dto/user-management.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { GetAdminUser } from '../decorators/get-admin-user.decorator';

// Define AdminRole enum locally
enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  ANALYST = 'ANALYST',
}

@Controller('admin/users')
@UseGuards(AdminJwtGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('stats')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.ANALYST)
  @UseGuards(AdminRolesGuard)
  async getUserStats() {
    return this.adminUsersService.getUserStats();
  }

  @Get()
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  @UseGuards(AdminRolesGuard)
  async getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminUsersService.getUsers(query);
  }

  @Get(':id')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  @UseGuards(AdminRolesGuard)
  async getUserById(@Param('id') userId: string) {
    return this.adminUsersService.getUserById(userId);
  }

  @Put(':id')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') userId: string,
    @Body() updateDto: AdminUserUpdateDto,
    @GetAdminUser('id') adminId: string
  ) {
    await this.adminUsersService.updateUser(userId, updateDto, adminId);
    return { message: 'User updated successfully' };
  }

  @Post(':id/suspend')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.OK)
  async suspendUser(
    @Param('id') userId: string,
    @Body() suspendDto: AdminUserSuspendDto,
    @GetAdminUser('id') adminId: string
  ) {
    await this.adminUsersService.suspendUser(userId, suspendDto, adminId);
    return { message: 'User suspended successfully' };
  }

  @Post(':id/unsuspend')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.OK)
  async unsuspendUser(
    @Param('id') userId: string,
    @GetAdminUser('id') adminId: string
  ) {
    await this.adminUsersService.unsuspendUser(userId, adminId);
    return { message: 'User unsuspended successfully' };
  }

  @Post(':id/verify')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.OK)
  async verifyUser(
    @Param('id') userId: string,
    @Body() verifyDto: AdminUserVerifyDto,
    @GetAdminUser('id') adminId: string
  ) {
    await this.adminUsersService.verifyUser(userId, verifyDto, adminId);
    return { message: 'User verification updated successfully' };
  }

  @Post(':id/note')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.OK)
  async addUserNote(
    @Param('id') userId: string,
    @Body() noteDto: AdminUserNoteDto,
    @GetAdminUser('id') adminId: string
  ) {
    await this.adminUsersService.addUserNote(userId, noteDto, adminId);
    return { message: 'Note added successfully' };
  }

  @Get(':id/activity')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  @UseGuards(AdminRolesGuard)
  async getUserActivity(
    @Param('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.adminUsersService.getUserActivity(userId, page, limit);
  }

  @Post('bulk-action')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.OK)
  async bulkUserAction(
    @Body() actionDto: AdminBulkUserActionDto,
    @GetAdminUser('id') adminId: string
  ) {
    await this.adminUsersService.bulkUserAction(actionDto, adminId);
    return { message: `Bulk action ${actionDto.action} completed successfully on ${actionDto.userIds.length} users` };
  }

  @Post('report')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  @UseGuards(AdminRolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async reportUser(
    @Body() reportDto: AdminUserReportDto,
    @GetAdminUser('id') reporterId: string
  ) {
    await this.adminUsersService.reportUser(reportDto, reporterId);
    return { message: 'User report submitted successfully' };
  }
}