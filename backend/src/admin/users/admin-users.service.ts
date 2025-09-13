import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  AdminUserQueryDto, 
  AdminUserUpdateDto, 
  AdminUserSuspendDto,
  AdminUserVerifyDto,
  AdminUserNoteDto,
  AdminUserStatsDto,
  AdminUserDetailDto,
  AdminUserListDto,
  AdminUserActivityDto,
  AdminBulkUserActionDto,
  AdminUserReportDto
} from '../dto/user-management.dto';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(): Promise<AdminUserStatsDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      verifiedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      cityStats,
      stateStats
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true, isBlocked: false } }),
      this.prisma.user.count({ where: { isBlocked: true } }),
      this.prisma.user.count({ where: { isPhoneVerified: true, isEmailVerified: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.user.groupBy({
        by: ['city'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      this.prisma.user.groupBy({
        by: ['state'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      verifiedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      topCities: cityStats.map(stat => ({ city: stat.city, count: stat._count.id || 0 })),
      topStates: stateStats.map(stat => ({ state: stat.state, count: stat._count.id || 0 }))
    };
  }

  async getUsers(query: AdminUserQueryDto): Promise<{
    users: AdminUserListDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, search, city, state, isActive, isBlocked, isVerified, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } }
      ];
    }

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive;
    if (isBlocked !== undefined) where.isBlocked = isBlocked;
    if (isVerified !== undefined) {
      where.AND = [
        { isPhoneVerified: isVerified },
        { isEmailVerified: isVerified }
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          listings: { select: { id: true } },
          wallet: { select: { balanceInKobo: true } },
          _count: {
            select: {
              sentOffers: { where: { status: 'ACCEPTED' } }
            }
          }
        }
      }),
      this.prisma.user.count({ where })
    ]);

    const formattedUsers: AdminUserListDto[] = users.map(user => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      state: user.state,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      totalListings: user.listings.length,
      completedTrades: user._count.sentOffers,
      walletBalance: user.wallet?.balanceInKobo || 0
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(userId: string): Promise<AdminUserDetailDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        listings: { select: { id: true, status: true } },
        wallet: { select: { balanceInKobo: true } },
        receivedReviews: { select: { rating: true } },
        reportsMade: { select: { id: true } },
        reportsReceived: { select: { id: true } },
        _count: {
          select: {
            sentOffers: { where: { status: 'ACCEPTED' } }
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate average rating
    const averageRating = user.receivedReviews.length > 0
      ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / user.receivedReviews.length
      : undefined;

    // Get moderation notes (we'll implement this when we create the moderation notes table)
    const moderationNotes: any[] = []; // TODO: Implement moderation notes

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      city: user.city,
      state: user.state,
      address: user.address || undefined,
      dateOfBirth: user.dateOfBirth || undefined,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalListings: user.listings.length,
      activeListings: user.listings.filter(listing => listing.status === 'ACTIVE').length,
      totalOffers: user._count.sentOffers,
      completedTrades: user._count.sentOffers,
      averageRating,
      walletBalance: user.wallet?.balanceInKobo || 0,
      reportsMade: user.reportsMade.length,
      reportsReceived: user.reportsReceived.length,
      moderationNotes
    };
  }

  async updateUser(userId: string, updateDto: AdminUserUpdateDto, adminId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateDto
    });

    // Log admin action
    await this.logAdminAction(adminId, 'USER_UPDATED', 'USER', userId, `User ${user.email} updated`);
  }

  async suspendUser(userId: string, suspendDto: AdminUserSuspendDto, adminId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBlocked) {
      throw new BadRequestException('User is already suspended');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        isActive: false
      }
    });

    // Log admin action
    await this.logAdminAction(
      adminId, 
      'USER_SUSPENDED', 
      'USER', 
      userId, 
      `User ${user.email} suspended: ${suspendDto.reason}`
    );
  }

  async unsuspendUser(userId: string, adminId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isBlocked) {
      throw new BadRequestException('User is not suspended');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        isActive: true
      }
    });

    // Log admin action
    await this.logAdminAction(adminId, 'USER_UNSUSPENDED', 'USER', userId, `User ${user.email} unsuspended`);
  }

  async verifyUser(userId: string, verifyDto: AdminUserVerifyDto, adminId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};
    if (verifyDto.isPhoneVerified !== undefined) {
      updateData.isPhoneVerified = verifyDto.isPhoneVerified;
    }
    if (verifyDto.isEmailVerified !== undefined) {
      updateData.isEmailVerified = verifyDto.isEmailVerified;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Log admin action
    await this.logAdminAction(adminId, 'USER_VERIFIED', 'USER', userId, `User ${user.email} verification updated`);
  }

  async addUserNote(userId: string, noteDto: AdminUserNoteDto, adminId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Implement moderation notes table
    // For now, we'll log it as an admin action
    await this.logAdminAction(
      adminId, 
      'USER_NOTE_ADDED', 
      'USER', 
      userId, 
      `Note added for ${user.email}: ${noteDto.note}`
    );
  }

  async bulkUserAction(actionDto: AdminBulkUserActionDto, adminId: string): Promise<void> {
    const { userIds, action, reason, notes } = actionDto;

    if (userIds.length === 0) {
      throw new BadRequestException('No users selected');
    }

    if (userIds.length > 100) {
      throw new BadRequestException('Cannot perform bulk action on more than 100 users at once');
    }

    const updateData: any = {};
    let actionDescription = '';

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        actionDescription = 'activated';
        break;
      case 'deactivate':
        updateData.isActive = false;
        actionDescription = 'deactivated';
        break;
      case 'block':
        updateData.isBlocked = true;
        updateData.isActive = false;
        actionDescription = 'blocked';
        break;
      case 'unblock':
        updateData.isBlocked = false;
        updateData.isActive = true;
        actionDescription = 'unblocked';
        break;
      case 'verify_email':
        updateData.isEmailVerified = true;
        actionDescription = 'email verified';
        break;
      case 'verify_phone':
        updateData.isPhoneVerified = true;
        actionDescription = 'phone verified';
        break;
      default:
        throw new BadRequestException('Invalid action');
    }

    await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData
    });

    // Log bulk action
    await this.logAdminAction(
      adminId,
      'BULK_USER_ACTION',
      'USER',
      userIds.join(','),
      `Bulk action ${actionDescription} performed on ${userIds.length} users. Reason: ${reason || 'No reason provided'}`
    );
  }

  async reportUser(reportDto: AdminUserReportDto, reporterId: string): Promise<void> {
    const reportedUser = await this.prisma.user.findUnique({
      where: { id: reportDto.reportedUserId }
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    await this.prisma.userReport.create({
      data: {
        reporterId,
        reportedUserId: reportDto.reportedUserId,
        reportType: reportDto.reportType as any,
        reason: reportDto.reason,
        details: reportDto.details,
        evidence: reportDto.evidence
      }
    });
  }

  async getUserActivity(userId: string, page: number = 1, limit: number = 20): Promise<AdminUserActivityDto> {
    // TODO: Implement user activity tracking
    // For now, return empty activities
    return {
      userId,
      activities: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
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
        severity: 'MEDIUM'
      }
    });
  }
}