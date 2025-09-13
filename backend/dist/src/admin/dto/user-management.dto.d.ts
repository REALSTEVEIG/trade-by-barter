export declare class AdminUserQueryDto {
    search?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
    isBlocked?: boolean;
    isVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class AdminUserUpdateDto {
    isActive?: boolean;
    isBlocked?: boolean;
    blockReason?: string;
}
export declare class AdminUserSuspendDto {
    reason: string;
    duration?: string;
    notes?: string;
}
export declare class AdminUserVerifyDto {
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    verificationNotes?: string;
}
export declare class AdminUserNoteDto {
    note: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export declare class AdminUserStatsDto {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    verifiedUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    topCities: {
        city: string;
        count: number;
    }[];
    topStates: {
        state: string;
        count: number;
    }[];
}
export declare class AdminUserDetailDto {
    id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    profileImageUrl?: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    city: string;
    state: string;
    address?: string;
    dateOfBirth?: Date;
    isActive: boolean;
    isBlocked: boolean;
    lastActiveAt: Date;
    createdAt: Date;
    updatedAt: Date;
    totalListings: number;
    activeListings: number;
    totalOffers: number;
    completedTrades: number;
    averageRating?: number;
    walletBalance: number;
    reportsMade: number;
    reportsReceived: number;
    moderationNotes: AdminModerationNoteDto[];
}
export declare class AdminModerationNoteDto {
    id: string;
    note: string;
    severity: string;
    createdAt: Date;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
}
export declare class AdminUserListDto {
    id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    isActive: boolean;
    isBlocked: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    lastActiveAt: Date;
    createdAt: Date;
    totalListings: number;
    completedTrades: number;
    walletBalance: number;
}
export declare class AdminUserActivityDto {
    userId: string;
    activities: AdminUserActivityItemDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class AdminUserActivityItemDto {
    id: string;
    type: string;
    description: string;
    details?: any;
    createdAt: Date;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AdminBulkUserActionDto {
    userIds: string[];
    action: 'activate' | 'deactivate' | 'block' | 'unblock' | 'verify_email' | 'verify_phone';
    reason?: string;
    notes?: string;
}
export declare class AdminUserReportDto {
    reportedUserId: string;
    reportType: string;
    reason: string;
    details?: string;
    evidence?: any;
}
