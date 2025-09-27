"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const listings_module_1 = require("./listings/listings.module");
const offers_module_1 = require("./offers/offers.module");
const payments_module_1 = require("./payments/payments.module");
const escrow_module_1 = require("./escrow/escrow.module");
const wallet_module_1 = require("./wallet/wallet.module");
const chat_module_1 = require("./chat/chat.module");
const media_module_1 = require("./media/media.module");
const admin_module_1 = require("./admin/admin.module");
const locations_module_1 = require("./locations/locations.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 60000,
                    limit: 20,
                },
                {
                    name: 'medium',
                    ttl: 600000,
                    limit: 100,
                },
                {
                    name: 'long',
                    ttl: 3600000,
                    limit: 500,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            listings_module_1.ListingsModule,
            offers_module_1.OffersModule,
            payments_module_1.PaymentsModule,
            escrow_module_1.EscrowModule,
            wallet_module_1.WalletModule,
            chat_module_1.ChatModule,
            media_module_1.MediaModule,
            admin_module_1.AdminModule,
            locations_module_1.LocationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_PIPE,
                useFactory: () => new common_2.ValidationPipe({
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    transform: true,
                    transformOptions: {
                        enableImplicitConversion: true,
                    },
                    validateCustomDecorators: true,
                    errorHttpStatusCode: 422,
                    exceptionFactory: (errors) => {
                        const errorMessages = errors.map(error => ({
                            field: error.property,
                            value: error.value,
                            constraints: Object.values(error.constraints || {}),
                        }));
                        return {
                            message: 'Validation failed',
                            details: {
                                errors: errorMessages,
                                suggestion: 'Please check your request data and fix the validation errors',
                            },
                            statusCode: 422,
                        };
                    },
                }),
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.GlobalExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map