import { UsersService, UserProfileResponse, PublicUserProfileResponse } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<UserProfileResponse>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileResponse>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        profileImageUrl: string;
    }>;
    getUserStats(userId: string): Promise<{
        totalListings: number;
        activeListings: number;
        completedTransactions: number;
        totalReviews: number;
        averageRating: number;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    getPublicProfile(userId: string): Promise<PublicUserProfileResponse>;
}
