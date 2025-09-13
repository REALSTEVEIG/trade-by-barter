import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsInt, Min, Max, IsUUID, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdminUserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isVerified?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AdminUserUpdateDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsString()
  blockReason?: string;
}

export class AdminUserSuspendDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  duration?: string; // e.g., "7d", "1m", "permanent"

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUserVerifyDto {
  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

export class AdminUserNoteDto {
  @IsString()
  note: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
}

export class AdminUserStatsDto {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  verifiedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  topCities: { city: string; count: number }[];
  topStates: { state: string; count: number }[];
}

export class AdminUserDetailDto {
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
  
  // Aggregated data
  totalListings: number;
  activeListings: number;
  totalOffers: number;
  completedTrades: number;
  averageRating?: number;
  walletBalance: number;
  
  // Moderation data
  reportsMade: number;
  reportsReceived: number;
  moderationNotes: AdminModerationNoteDto[];
}

export class AdminModerationNoteDto {
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

export class AdminUserListDto {
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

export class AdminUserActivityDto {
  userId: string;
  activities: AdminUserActivityItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AdminUserActivityItemDto {
  id: string;
  type: string;
  description: string;
  details?: any;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class AdminBulkUserActionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @IsEnum(['activate', 'deactivate', 'block', 'unblock', 'verify_email', 'verify_phone'])
  action: 'activate' | 'deactivate' | 'block' | 'unblock' | 'verify_email' | 'verify_phone';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUserReportDto {
  @IsUUID()
  reportedUserId: string;

  @IsEnum(['HARASSMENT', 'SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'SCAM', 'PAYMENT_DISPUTE', 'TERMS_VIOLATION', 'OTHER'])
  reportType: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  evidence?: any; // JSON object for evidence
}