"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoles = exports.ADMIN_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ADMIN_ROLES_KEY = 'adminRoles';
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
    AdminRole["SUPPORT"] = "SUPPORT";
    AdminRole["ANALYST"] = "ANALYST";
})(AdminRole || (AdminRole = {}));
const AdminRoles = (...roles) => (0, common_1.SetMetadata)(exports.ADMIN_ROLES_KEY, roles);
exports.AdminRoles = AdminRoles;
//# sourceMappingURL=admin-roles.decorator.js.map