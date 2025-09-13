"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const security_service_1 = require("./security.service");
const nigerian_compliance_service_1 = require("./nigerian-compliance.service");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    name: 'short',
                    ttl: 60000,
                    limit: 100,
                }, {
                    name: 'medium',
                    ttl: 600000,
                    limit: 500,
                }, {
                    name: 'long',
                    ttl: 3600000,
                    limit: 2000,
                }]),
        ],
        providers: [
            security_service_1.SecurityService,
            nigerian_compliance_service_1.NigerianComplianceService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
        exports: [
            security_service_1.SecurityService,
            nigerian_compliance_service_1.NigerianComplianceService,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map