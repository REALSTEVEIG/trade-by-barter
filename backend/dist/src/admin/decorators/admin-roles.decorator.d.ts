export declare const ADMIN_ROLES_KEY = "adminRoles";
declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR",
    SUPPORT = "SUPPORT",
    ANALYST = "ANALYST"
}
export declare const AdminRoles: (...roles: AdminRole[]) => import("@nestjs/common").CustomDecorator<string>;
export {};
