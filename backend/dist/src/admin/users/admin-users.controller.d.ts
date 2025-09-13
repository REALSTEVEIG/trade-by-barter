import { AdminUsersService } from './admin-users.service';
import { AdminUserQueryDto, AdminUserUpdateDto, AdminUserSuspendDto, AdminUserVerifyDto, AdminUserNoteDto, AdminBulkUserActionDto, AdminUserReportDto } from '../dto/user-management.dto';
export declare class AdminUsersController {
    private readonly adminUsersService;
    constructor(adminUsersService: AdminUsersService);
    getUserStats(): Promise<import("../dto/user-management.dto").AdminUserStatsDto>;
    getUsers(query: AdminUserQueryDto): Promise<{
        users: import("../dto/user-management.dto").AdminUserListDto[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserById(userId: string): Promise<import("../dto/user-management.dto").AdminUserDetailDto>;
    updateUser(userId: string, updateDto: AdminUserUpdateDto, adminId: string): Promise<{
        message: string;
    }>;
    suspendUser(userId: string, suspendDto: AdminUserSuspendDto, adminId: string): Promise<{
        message: string;
    }>;
    unsuspendUser(userId: string, adminId: string): Promise<{
        message: string;
    }>;
    verifyUser(userId: string, verifyDto: AdminUserVerifyDto, adminId: string): Promise<{
        message: string;
    }>;
    addUserNote(userId: string, noteDto: AdminUserNoteDto, adminId: string): Promise<{
        message: string;
    }>;
    getUserActivity(userId: string, page?: number, limit?: number): Promise<import("../dto/user-management.dto").AdminUserActivityDto>;
    bulkUserAction(actionDto: AdminBulkUserActionDto, adminId: string): Promise<{
        message: string;
    }>;
    reportUser(reportDto: AdminUserReportDto, reporterId: string): Promise<{
        message: string;
    }>;
}
