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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const offers_service_1 = require("./offers.service");
const dto_1 = require("./dto");
let OffersController = class OffersController {
    offersService;
    constructor(offersService) {
        this.offersService = offersService;
    }
    async createOffer(userId, createOfferDto) {
        return this.offersService.createOffer(userId, createOfferDto);
    }
    async getOffers(userId, type = 'received', page, limit) {
        return this.offersService.getOffers(userId, type, page, limit);
    }
    async getOfferStats(userId) {
        return this.offersService.getOfferStats(userId);
    }
    async getOffersForListing(userId, listingId, page, limit) {
        return this.offersService.getOffersForListing(listingId, userId, page, limit);
    }
    async getOfferById(userId, id) {
        return this.offersService.getOfferById(id, userId);
    }
    async acceptOffer(userId, id) {
        return this.offersService.acceptOffer(id, userId);
    }
    async rejectOffer(userId, id) {
        return this.offersService.rejectOffer(id, userId);
    }
    async createCounterOffer(userId, id, counterOfferDto) {
        return this.offersService.createCounterOffer(id, userId, counterOfferDto);
    }
    async withdrawOffer(userId, id) {
        return this.offersService.withdrawOffer(id, userId);
    }
};
exports.OffersController = OffersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new offer',
        description: 'Create a new offer on a listing. Supports cash, swap, and hybrid offers.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Offer created successfully',
        type: dto_1.OfferResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid offer data or business rule violation',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Listing not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already has a pending offer on this listing',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateOfferDto]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user offers',
        description: 'Get offers sent or received by the current user with pagination.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        enum: ['sent', 'received'],
        required: false,
        description: 'Type of offers to retrieve',
        example: 'received',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        type: Number,
        required: false,
        description: 'Page number for pagination',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of offers per page',
        example: 20,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Offers retrieved successfully',
        type: dto_1.GetOffersResponse,
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getOffers", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user offer statistics',
        description: 'Get comprehensive statistics about user offers including success rates and total values.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Offer statistics retrieved successfully',
        type: dto_1.OfferStatsResponse,
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getOfferStats", null);
__decorate([
    (0, common_1.Get)('listing/:listingId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get offers for a specific listing',
        description: 'Get all offers for a listing owned by the current user.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'listingId',
        description: 'UUID of the listing',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        type: Number,
        required: false,
        description: 'Page number for pagination',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of offers per page',
        example: 20,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Listing offers retrieved successfully',
        type: dto_1.GetOffersResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'User does not own this listing',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Listing not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('listingId')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getOffersForListing", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get offer by ID',
        description: 'Get detailed information about a specific offer.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID of the offer',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Offer retrieved successfully',
        type: dto_1.OfferResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'User does not have permission to view this offer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Offer not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getOfferById", null);
__decorate([
    (0, common_1.Put)(':id/accept'),
    (0, swagger_1.ApiOperation)({
        summary: 'Accept an offer',
        description: 'Accept a pending offer. Only the listing owner can accept offers.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID of the offer to accept',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Offer accepted successfully',
        type: dto_1.OfferResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Offer cannot be accepted (not pending or expired)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the listing owner can accept offers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Offer not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "acceptOffer", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject an offer',
        description: 'Reject a pending offer. Only the listing owner can reject offers.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID of the offer to reject',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Offer rejected successfully',
        type: dto_1.OfferResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Offer cannot be rejected (not pending)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the listing owner can reject offers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Offer not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "rejectOffer", null);
__decorate([
    (0, common_1.Post)(':id/counter'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a counteroffer',
        description: 'Create a counteroffer to an existing offer. Only the listing owner can create counteroffers.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID of the original offer to counter',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Counteroffer created successfully',
        type: dto_1.OfferResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid counteroffer data or maximum counteroffers reached',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the listing owner can create counteroffers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Original offer not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CounterOfferDto]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "createCounterOffer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Withdraw an offer',
        description: 'Withdraw a pending offer. Only the offerer can withdraw their own offers.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID of the offer to withdraw',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Offer withdrawn successfully',
        type: dto_1.OfferResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Offer cannot be withdrawn (not pending)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the offerer can withdraw their offer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Offer not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "withdrawOffer", null);
exports.OffersController = OffersController = __decorate([
    (0, swagger_1.ApiTags)('Offers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/offers'),
    __metadata("design:paramtypes", [offers_service_1.OffersService])
], OffersController);
//# sourceMappingURL=offers.controller.js.map