"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let RateLimitInterceptor = class RateLimitInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        request.rateLimitInfo = {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            timestamp: new Date(),
        };
        return next.handle().pipe((0, operators_1.catchError)((error) => {
            if (error.status === 429) {
                return (0, rxjs_1.throwError)(() => new common_1.HttpException({
                    statusCode: 429,
                    message: 'Too many requests. Please wait a moment before trying again.',
                    error: 'Rate Limit Exceeded',
                    retryAfter: 60,
                    info: 'This helps protect our service for all Nigerian users.',
                }, common_1.HttpStatus.TOO_MANY_REQUESTS));
            }
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.RateLimitInterceptor = RateLimitInterceptor;
exports.RateLimitInterceptor = RateLimitInterceptor = __decorate([
    (0, common_1.Injectable)()
], RateLimitInterceptor);
//# sourceMappingURL=rate-limit.interceptor.js.map