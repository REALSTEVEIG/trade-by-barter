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
exports.AdminUsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminUsersService = class AdminUsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [totalUsers, activeUsers, blockedUsers, verifiedUsers, newUsersToday, newUsersThisWeek, newUsersThisMonth, cityStats, stateStats] = await Promise.all([
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
    async getUsers(query) {
        const { page = 1, limit = 20, search, city, state, isActive, isBlocked, isVerified, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search } }
            ];
        }
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (state)
            where.state = { contains: state, mode: 'insensitive' };
        if (isActive !== undefined)
            where.isActive = isActive;
        if (isBlocked !== undefined)
            where.isBlocked = isBlocked;
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
        const formattedUsers = users.map(user => ({
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
    async getUserById(userId) {
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
            throw new common_1.NotFoundException('User not found');
        }
        const averageRating = user.receivedReviews.length > 0
            ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / user.receivedReviews.length
            : undefined;
        const moderationNotes = [];
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
    async updateUser(userId, updateDto, adminId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: updateDto
        });
        await this.logAdminAction(adminId, 'USER_UPDATED', 'USER', userId, `User ${user.email} updated`);
    }
    async suspendUser(userId, suspendDto, adminId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isBlocked) {
            throw new common_1.BadRequestException('User is already suspended');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBlocked: true,
                isActive: false
            }
        });
        await this.logAdminAction(adminId, 'USER_SUSPENDED', 'USER', userId, `User ${user.email} suspended: ${suspendDto.reason}`);
    }
    async unsuspendUser(userId, adminId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.isBlocked) {
            throw new common_1.BadRequestException('User is not suspended');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBlocked: false,
                isActive: true
            }
        });
        await this.logAdminAction(adminId, 'USER_UNSUSPENDED', 'USER', userId, `User ${user.email} unsuspended`);
    }
    async verifyUser(userId, verifyDto, adminId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updateData = {};
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
        await this.logAdminAction(adminId, 'USER_VERIFIED', 'USER', userId, `User ${user.email} verification updated`);
    }
    async addUserNote(userId, noteDto, adminId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.logAdminAction(adminId, 'USER_NOTE_ADDED', 'USER', userId, `Note added for ${user.email}: ${noteDto.note}`);
    }
    async bulkUserAction(actionDto, adminId) {
        const { userIds, action, reason, notes } = actionDto;
        if (userIds.length === 0) {
            throw new common_1.BadRequestException('No users selected');
        }
        if (userIds.length > 100) {
            throw new common_1.BadRequestException('Cannot perform bulk action on more than 100 users at once');
        }
        const updateData = {};
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
                throw new common_1.BadRequestException('Invalid action');
        }
        await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: updateData
        });
        await this.logAdminAction(adminId, 'BULK_USER_ACTION', 'USER', userIds.join(','), `Bulk action ${actionDescription} performed on ${userIds.length} users. Reason: ${reason || 'No reason provided'}`);
    }
    async reportUser(reportDto, reporterId) {
        const reportedUser = await this.prisma.user.findUnique({
            where: { id: reportDto.reportedUserId }
        });
        if (!reportedUser) {
            throw new common_1.NotFoundException('Reported user not found');
        }
        await this.prisma.userReport.create({
            data: {
                reporterId,
                reportedUserId: reportDto.reportedUserId,
                reportType: reportDto.reportType,
                reason: reportDto.reason,
                details: reportDto.details,
                evidence: reportDto.evidence
            }
        });
    }
    async getUserActivity(userId, page = 1, limit = 20) {
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
    async logAdminAction(adminId, action, targetType, targetId, description) {
        await this.prisma.adminAuditLog.create({
            data: {
                adminId,
                action: action,
                targetType: targetType,
                targetId,
                description,
                severity: 'MEDIUM'
            }
        });
    }
};
exports.AdminUsersService = AdminUsersService;
exports.AdminUsersService = AdminUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminUsersService);
//# sourceMappingURL=admin-users.service.js.map