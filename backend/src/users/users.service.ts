import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import * as argon2 from 'argon2';

export interface UserProfileResponse {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  city: string;
  state: string;
  address?: string | null;
  dateOfBirth?: Date | null;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface PublicUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  city: string;
  state: string;
  isPhoneVerified: boolean;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
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
      throw new NotFoundException('User not found or account is inactive');
    }

    const { isActive, isBlocked, ...userProfile } = user;
    return userProfile;
  }

  async getPublicUserProfile(userId: string): Promise<PublicUserProfileResponse> {
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
      throw new NotFoundException('User not found or account is inactive');
    }

    const { isActive, isBlocked, ...publicProfile } = user;
    return publicProfile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileResponse> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, isBlocked: true },
    });

    if (!existingUser || !existingUser.isActive || existingUser.isBlocked) {
      throw new NotFoundException('User not found or account is inactive');
    }

    // Prepare update data
    const updateData: any = { ...updateProfileDto };

    // Convert dateOfBirth string to Date if provided
    if (updateProfileDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
    }

    // Update user profile
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

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Check if new password and confirmation match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // Get user with current password
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
      throw new NotFoundException('User not found or account is inactive');
    }

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await argon2.hash(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        // Clear refresh tokens to force re-login
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfileImage(userId: string, imageUrl: string): Promise<{ message: string; profileImageUrl: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, isBlocked: true },
    });

    if (!existingUser || !existingUser.isActive || existingUser.isBlocked) {
      throw new NotFoundException('User not found or account is inactive');
    }

    // Update profile image URL
    await this.prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
    });

    return {
      message: 'Profile image updated successfully',
      profileImageUrl: imageUrl,
    };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by marking as inactive
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

  async getUserStats(userId: string): Promise<{
    totalListings: number;
    activeListings: number;
    completedTransactions: number;
    totalReviews: number;
    averageRating: number;
  }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, isBlocked: true },
    });

    if (!existingUser || !existingUser.isActive || existingUser.isBlocked) {
      throw new NotFoundException('User not found or account is inactive');
    }

    // Get user statistics
    const [
      totalListings,
      activeListings,
      completedTransactions,
      reviews,
    ] = await Promise.all([
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
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    };
  }
}