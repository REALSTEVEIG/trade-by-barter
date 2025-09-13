"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdminUser = void 0;
const common_1 = require("@nestjs/common");
exports.GetAdminUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.admin;
    if (!admin) {
        return null;
    }
    return data ? admin[data] : admin;
});
//# sourceMappingURL=get-admin-user.decorator.js.map