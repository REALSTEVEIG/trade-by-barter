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
var EscrowController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const escrow_service_1 = require("./escrow.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const create_escrow_dto_1 = require("./dto/create-escrow.dto");
const escrow_response_dto_1 = require("./dto/escrow-response.dto");
const release_escrow_dto_1 = require("./dto/release-escrow.dto");
const dispute_escrow_dto_1 = require("./dto/dispute-escrow.dto");
let EscrowController = EscrowController_1 = class EscrowController {
    escrowService;
    logger = new common_1.Logger(EscrowController_1.name);
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    async createEscrow(userId, createEscrowData) {
        this.logger.log(`Escrow creation request from user: ${userId}`);
        return this.escrowService.createEscrow(userId, createEscrowData);
    }
    async releaseEscrow(escrowId, userId, releaseData) {
        this.logger.log(`Escrow release request for ${escrowId} from user: ${userId}`);
        return this.escrowService.releaseEscrow(escrowId, userId, releaseData);
    }
    async disputeEscrow(escrowId, userId, disputeData) {
        this.logger.log(`Escrow dispute request for ${escrowId} from user: ${userId}`);
        return this.escrowService.disputeEscrow(escrowId, userId, disputeData);
    }
    async getUserEscrows(userId) {
        this.logger.log(`User escrows request from user: ${userId}`);
        return this.escrowService.getUserEscrows(userId);
    }
    async getEscrowById(escrowId, userId) {
        this.logger.log(`Escrow details request for ${escrowId} from user: ${userId}`);
        return this.escrowService.getEscrowById(escrowId, userId);
    }
};
exports.EscrowController = EscrowController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create escrow for accepted offer',
        description: 'Create an escrow account to secure funds for an accepted trade offer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Escrow created successfully',
        type: escrow_response_dto_1.EscrowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request or insufficient funds',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Offer not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to create escrow for this offer',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_escrow_dto_1.CreateEscrowDto]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "createEscrow", null);
__decorate([
    (0, common_1.Put)(':id/release'),
    (0, swagger_1.ApiOperation)({
        summary: 'Release escrow funds',
        description: 'Release escrow funds to the seller after trade completion',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Escrow released successfully',
        type: release_escrow_dto_1.ReleaseEscrowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request or escrow cannot be released',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Escrow not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to release this escrow',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, release_escrow_dto_1.ReleaseEscrowDto]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "releaseEscrow", null);
__decorate([
    (0, common_1.Post)(':id/dispute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Open dispute for escrow',
        description: 'Open a dispute to freeze escrow funds until resolution',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Dispute opened successfully',
        type: dispute_escrow_dto_1.DisputeEscrowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request or escrow cannot be disputed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Escrow not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to dispute this escrow',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dispute_escrow_dto_1.DisputeEscrowDto]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "disputeEscrow", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user escrow accounts',
        description: 'Get all escrow accounts for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User escrows retrieved successfully',
        type: escrow_response_dto_1.EscrowListResponseDto,
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getUserEscrows", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get escrow details',
        description: 'Get detailed information about a specific escrow',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Escrow details retrieved successfully',
        type: escrow_response_dto_1.EscrowResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Escrow not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to view this escrow',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getEscrowById", null);
exports.EscrowController = EscrowController = EscrowController_1 = __decorate([
    (0, swagger_1.ApiTags)('Escrow'),
    (0, common_1.Controller)('api/v1/escrow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [escrow_service_1.EscrowService])
], EscrowController);
//# sourceMappingURL=escrow.controller.js.map