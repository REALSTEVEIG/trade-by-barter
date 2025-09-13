import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
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
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserProfile(userId: string): Promise<UserProfileResponse>;
    getPublicUserProfile(userId: string): Promise<PublicUserProfileResponse>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileResponse>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updateProfileImage(userId: string, imageUrl: string): Promise<{
        message: string;
        profileImageUrl: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    getUserStats(userId: string): Promise<{
        totalListings: number;
        activeListings: number;
        completedTransactions: number;
        totalReviews: number;
        averageRating: number;
    }>;
}
