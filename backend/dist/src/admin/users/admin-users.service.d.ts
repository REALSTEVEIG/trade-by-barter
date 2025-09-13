import { PrismaService } from '../../prisma/prisma.service';
import { AdminUserQueryDto, AdminUserUpdateDto, AdminUserSuspendDto, AdminUserVerifyDto, AdminUserNoteDto, AdminUserStatsDto, AdminUserDetailDto, AdminUserListDto, AdminUserActivityDto, AdminBulkUserActionDto, AdminUserReportDto } from '../dto/user-management.dto';
export declare class AdminUsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserStats(): Promise<AdminUserStatsDto>;
    getUsers(query: AdminUserQueryDto): Promise<{
        users: AdminUserListDto[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserById(userId: string): Promise<AdminUserDetailDto>;
    updateUser(userId: string, updateDto: AdminUserUpdateDto, adminId: string): Promise<void>;
    suspendUser(userId: string, suspendDto: AdminUserSuspendDto, adminId: string): Promise<void>;
    unsuspendUser(userId: string, adminId: string): Promise<void>;
    verifyUser(userId: string, verifyDto: AdminUserVerifyDto, adminId: string): Promise<void>;
    addUserNote(userId: string, noteDto: AdminUserNoteDto, adminId: string): Promise<void>;
    bulkUserAction(actionDto: AdminBulkUserActionDto, adminId: string): Promise<void>;
    reportUser(reportDto: AdminUserReportDto, reporterId: string): Promise<void>;
    getUserActivity(userId: string, page?: number, limit?: number): Promise<AdminUserActivityDto>;
    private logAdminAction;
}
