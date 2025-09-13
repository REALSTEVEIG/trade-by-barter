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
var WalletController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const wallet_response_dto_1 = require("./dto/wallet-response.dto");
const transfer_funds_dto_1 = require("./dto/transfer-funds.dto");
const transaction_history_dto_1 = require("./dto/transaction-history.dto");
let WalletController = WalletController_1 = class WalletController {
    walletService;
    logger = new common_1.Logger(WalletController_1.name);
    constructor(walletService) {
        this.walletService = walletService;
    }
    async getWalletInfo(userId) {
        this.logger.log(`Wallet info request from user: ${userId}`);
        return this.walletService.getWalletInfo(userId);
    }
    async getTransactionHistory(userId, query) {
        this.logger.log(`Transaction history request from user: ${userId}, query:`, query);
        return this.walletService.getTransactionHistory(userId, query);
    }
    async transferFunds(userId, transferData) {
        this.logger.log(`Transfer request from user: ${userId} to ${transferData.recipientId}`);
        return this.walletService.transferFunds(userId, transferData);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get wallet balance and info',
        description: 'Get wallet balance, statistics, and account information for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet information retrieved successfully',
        type: wallet_response_dto_1.WalletInfoResponseDto,
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWalletInfo", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction history',
        description: 'Get paginated transaction history for the authenticated user with optional filtering',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 20, max: 100)',
        example: 20,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        type: String,
        description: 'Filter by transaction type',
        enum: [
            'WALLET_TOPUP',
            'WALLET_WITHDRAWAL',
            'ESCROW_DEPOSIT',
            'ESCROW_RELEASE',
            'ESCROW_REFUND',
            'TRANSFER_SENT',
            'TRANSFER_RECEIVED',
            'FEE_CHARGE',
            'REFUND',
            'PURCHASE',
            'SALE',
        ],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        type: String,
        description: 'Filter by transaction status',
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history retrieved successfully',
        type: transaction_history_dto_1.TransactionHistoryResponseDto,
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_history_dto_1.TransactionHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer funds between users',
        description: 'Transfer money from your wallet to another user\'s wallet',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transfer completed successfully',
        type: transfer_funds_dto_1.TransferResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request or insufficient funds',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Recipient user not found',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transfer_funds_dto_1.TransferFundsDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transferFunds", null);
exports.WalletController = WalletController = WalletController_1 = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('api/v1/wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map