"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferStatsResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class OfferStatsResponse {
    totalSent;
    totalReceived;
    pendingSent;
    pendingReceived;
    totalAccepted;
    totalRejected;
    successRate;
    averageResponseTime;
    totalValueInKobo;
    displayTotalValue;
}
exports.OfferStatsResponse = OfferStatsResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of offers sent by the user',
        example: 15,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "totalSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of offers received by the user',
        example: 23,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "totalReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of pending offers sent',
        example: 3,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "pendingSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of pending offers received',
        example: 5,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "pendingReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of accepted offers',
        example: 8,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "totalAccepted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of rejected offers',
        example: 12,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "totalRejected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success rate as a percentage',
        example: 53.3,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "successRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average response time in hours',
        example: 18.5,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "averageResponseTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total value of accepted offers in kobo',
        example: 450000000,
    }),
    __metadata("design:type", Number)
], OfferStatsResponse.prototype, "totalValueInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Formatted total value for display',
        example: '₦4,500,000',
    }),
    __metadata("design:type", String)
], OfferStatsResponse.prototype, "displayTotalValue", void 0);
//# sourceMappingURL=offer-stats.dto.js.map