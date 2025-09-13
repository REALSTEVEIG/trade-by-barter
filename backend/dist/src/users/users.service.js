"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2 = __importStar(require("argon2"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                displayName: true,
                profileImageUrl: true,
                isPhoneVerified: true,
                isEmailVerified: true,
                city: true,
                state: true,
                address: true,
                dateOfBirth: true,
                lastActiveAt: true,
                createdAt: true,
                isActive: true,
                isBlocked: true,
            },
        });
        if (!user || !user.isActive || user.isBlocked) {
            throw new common_1.NotFoundException('User not found or account is inactive');
        }
        const { isActive, isBlocked, ...userProfile } = user;
        return userProfile;
    }
    async getPublicUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
                profileImageUrl: true,
                city: true,
                state: true,
                isPhoneVerified: true,
                createdAt: true,
                isActive: true,
                isBlocked: true,
            },
        });
        if (!user || !user.isActive || user.isBlocked) {
            throw new common_1.NotFoundException('User not found or account is inactive');
        }
        const { isActive, isBlocked, ...publicProfile } = user;
        return publicProfile;
    }
    async updateProfile(userId, updateProfileDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isActive: true, isBlocked: true },
        });
        if (!existingUser || !existingUser.isActive || existingUser.isBlocked) {
            throw new common_1.NotFoundException('User not found or account is inactive');
        }
        const updateData = { ...updateProfileDto };
        if (updateProfileDto.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                displayName: true,
                profileImageUrl: true,
                isPhoneVerified: true,
                isEmailVerified: true,
                city: true,
                state: true,
                address: true,
                dateOfBirth: true,
                lastActiveAt: true,
                createdAt: true,
            },
        });
        return updatedUser;
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
        if (newPassword !== confirmPassword) {
            throw new common_1.BadRequestException('New password and confirmation do not match');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
                isActive: true,
                isBlocked: true,
            },
        });
        if (!user || !user.isActive || user.isBlocked) {
            throw new common_1.NotFoundException('User not found or account is inactive');
        }
        const isCurrentPasswordValid = await argon2.verify(user.password, currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedNewPassword = await argon2.hash(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                refreshToken: null,
                refreshTokenExpiresAt: null,
            },
        });
        return { message: 'Password changed successfully' };
    }
    async updateProfileImage(userId, imageUrl) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isActive: true, isBlocked: true },
        });
        if (!existingUser || !existingUser.isActive || existingUser.isBlocked) {
            throw new common_1.NotFoundException('User not found or account is inactive');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { profileImageUrl: imageUrl },
        });
        return {
            message: 'Profile image updated successfully',
            profileImageUrl: imageUrl,
        };
    }
    async deleteAccount(userId) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isActive: true },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                refreshToken: null,
                refreshTokenExpiresAt: null,
                phoneOtp: null,
                phoneOtpExpiresAt: null,
            },
        });
        return { message: 'Account deleted successfully' };
    }
    async getUserStats(userId) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isActive: true, isBlocked: true },
        });
        if (!existingUser || !existingUser.isActive || existingUser.isBlocked) {
            throw new common_1.NotFoundException('User not found or account is inactive');
        }
        const [totalListings, activeListings, completedTransactions, reviews,] = await Promise.all([
            this.prisma.listing.count({
                where: { userId },
            }),
            this.prisma.listing.count({
                where: { userId, isActive: true },
            }),
            this.prisma.transaction.count({
                where: {
                    OR: [{ senderId: userId }, { receiverId: userId }],
                    status: 'COMPLETED',
                },
            }),
            this.prisma.review.findMany({
                where: { receiverId: userId },
                select: { rating: true },
            }),
        ]);
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;
        return {
            totalListings,
            activeListings,
            completedTransactions,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map