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
var EscrowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const payment_exception_1 = require("../common/exceptions/payment.exception");
let EscrowService = EscrowService_1 = class EscrowService {
    prisma;
    logger = new common_1.Logger(EscrowService_1.name);
    ESCROW_FEE_PERCENTAGE = 0.025;
    AUTO_RELEASE_DAYS = 7;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEscrow(userId, createEscrowData) {
        this.logger.log(`Creating escrow for offer ${createEscrowData.offerId} by user ${userId}`);
        const offer = await this.prisma.offer.findUnique({
            where: { id: createEscrowData.offerId },
            include: {
                sender: { include: { wallet: true } },
                receiver: { include: { wallet: true } },
                listing: true,
            },
        });
        if (!offer) {
            throw new payment_exception_1.EscrowException('Offer not found', 404);
        }
        if (offer.status !== 'ACCEPTED') {
            throw new payment_exception_1.InvalidEscrowStateException(offer.status, 'ACCEPTED');
        }
        const existingEscrow = await this.prisma.escrow.findFirst({
            where: { offerId: offer.id },
        });
        if (existingEscrow) {
            throw new payment_exception_1.EscrowException('Escrow already exists for this offer', 409);
        }
        const isOfferSenderBuyer = offer.offerType === 'CASH' || offer.offerType === 'HYBRID';
        const buyer = isOfferSenderBuyer ? offer.sender : offer.receiver;
        const seller = isOfferSenderBuyer ? offer.receiver : offer.sender;
        if (userId !== buyer.id && userId !== seller.id) {
            throw new payment_exception_1.UnauthorizedEscrowAccessException();
        }
        let escrowAmount;
        if (createEscrowData.customAmountInKobo) {
            escrowAmount = createEscrowData.customAmountInKobo;
        }
        else if (offer.cashAmountInKobo) {
            escrowAmount = offer.cashAmountInKobo;
        }
        else {
            escrowAmount = offer.listing.priceInKobo || 100000;
        }
        const feeInKobo = Math.floor(escrowAmount * this.ESCROW_FEE_PERCENTAGE);
        const totalAmount = escrowAmount + feeInKobo;
        if (!buyer.wallet || buyer.wallet.balanceInKobo < totalAmount) {
            throw new payment_exception_1.InsufficientFundsException(buyer.wallet?.balanceInKobo || 0, totalAmount);
        }
        const reference = `ESC_${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.AUTO_RELEASE_DAYS);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const escrow = await tx.escrow.create({
                    data: {
                        reference,
                        amountInKobo: escrowAmount,
                        feeInKobo,
                        status: 'CREATED',
                        description: createEscrowData.description || `Escrow for ${offer.listing.title}`,
                        releaseCondition: createEscrowData.releaseCondition || 'Both parties confirm trade completion',
                        expiresAt,
                        buyerId: buyer.id,
                        sellerId: seller.id,
                        offerId: offer.id,
                    },
                });
                await tx.wallet.update({
                    where: { userId: buyer.id },
                    data: {
                        balanceInKobo: {
                            decrement: totalAmount,
                        },
                        escrowBalanceInKobo: {
                            increment: escrowAmount,
                        },
                        lastTransactionAt: new Date(),
                    },
                });
                await tx.transaction.create({
                    data: {
                        type: 'ESCROW_DEPOSIT',
                        amountInKobo: escrowAmount,
                        status: 'COMPLETED',
                        paymentMethod: 'WALLET',
                        description: `Escrow deposit for ${offer.listing.title}`,
                        processingFee: feeInKobo,
                        senderId: buyer.id,
                        receiverId: seller.id,
                        offerId: offer.id,
                        escrowId: escrow.id,
                    },
                });
                const fundedEscrow = await tx.escrow.update({
                    where: { id: escrow.id },
                    data: { status: 'FUNDED' },
                });
                return fundedEscrow;
            });
            this.logger.log(`Escrow created successfully: ${reference}`);
            return this.mapToEscrowResponse(result);
        }
        catch (error) {
            this.logger.error(`Failed to create escrow: ${error.message}`, error.stack);
            if (error instanceof payment_exception_1.EscrowException ||
                error instanceof payment_exception_1.InsufficientFundsException ||
                error instanceof payment_exception_1.UnauthorizedEscrowAccessException ||
                error instanceof payment_exception_1.InvalidEscrowStateException) {
                throw error;
            }
            throw new payment_exception_1.EscrowException('Escrow creation failed', 500, { originalError: error.message });
        }
    }
    async releaseEscrow(escrowId, userId, releaseData) {
        this.logger.log(`Releasing escrow ${escrowId} by user ${userId}`);
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
            include: {
                buyer: { include: { wallet: true } },
                seller: { include: { wallet: true } },
                offer: { include: { listing: true } },
            },
        });
        if (!escrow) {
            throw new payment_exception_1.EscrowException('Escrow not found', 404);
        }
        if (escrow.status !== 'FUNDED') {
            throw new payment_exception_1.InvalidEscrowStateException(escrow.status, 'FUNDED');
        }
        if (userId !== escrow.buyerId && userId !== escrow.sellerId && userId !== 'SYSTEM') {
            throw new payment_exception_1.UnauthorizedEscrowAccessException();
        }
        if (!releaseData.confirmCompletion) {
            throw new payment_exception_1.EscrowException('Trade completion confirmation required', 400);
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                await tx.wallet.update({
                    where: { userId: escrow.sellerId },
                    data: {
                        balanceInKobo: {
                            increment: escrow.amountInKobo,
                        },
                        totalEarnedInKobo: {
                            increment: escrow.amountInKobo,
                        },
                        lastTransactionAt: new Date(),
                    },
                });
                await tx.wallet.update({
                    where: { userId: escrow.buyerId },
                    data: {
                        escrowBalanceInKobo: {
                            decrement: escrow.amountInKobo,
                        },
                        lastTransactionAt: new Date(),
                    },
                });
                await tx.transaction.create({
                    data: {
                        type: 'ESCROW_RELEASE',
                        amountInKobo: escrow.amountInKobo,
                        status: 'COMPLETED',
                        paymentMethod: 'WALLET',
                        description: releaseData.reason || `Escrow release for ${escrow.offer.listing.title}`,
                        senderId: escrow.buyerId,
                        receiverId: escrow.sellerId,
                        offerId: escrow.offerId,
                        escrowId: escrow.id,
                    },
                });
                const releasedEscrow = await tx.escrow.update({
                    where: { id: escrowId },
                    data: {
                        status: 'RELEASED',
                        releasedAt: new Date(),
                    },
                });
                return releasedEscrow;
            });
            this.logger.log(`Escrow released successfully: ${escrow.reference}`);
            return {
                success: true,
                message: 'Escrow funds released successfully',
                escrowId,
                amountReleased: escrow.amountInKobo,
                recipientId: escrow.sellerId,
                releasedAt: result.releasedAt.toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to release escrow: ${error.message}`, error.stack);
            if (error instanceof payment_exception_1.EscrowException ||
                error instanceof payment_exception_1.UnauthorizedEscrowAccessException ||
                error instanceof payment_exception_1.InvalidEscrowStateException) {
                throw error;
            }
            throw new payment_exception_1.EscrowException('Failed to release escrow', 500, { originalError: error.message });
        }
    }
    async disputeEscrow(escrowId, userId, disputeData) {
        this.logger.log(`Opening dispute for escrow ${escrowId} by user ${userId}`);
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
        });
        if (!escrow) {
            throw new payment_exception_1.EscrowException('Escrow not found', 404);
        }
        if (escrow.status !== 'FUNDED') {
            throw new payment_exception_1.InvalidEscrowStateException(escrow.status, 'FUNDED');
        }
        if (userId !== escrow.buyerId && userId !== escrow.sellerId) {
            throw new payment_exception_1.UnauthorizedEscrowAccessException();
        }
        try {
            const disputedEscrow = await this.prisma.escrow.update({
                where: { id: escrowId },
                data: {
                    status: 'DISPUTED',
                    disputeReason: disputeData.reason,
                    disputeOpenedAt: new Date(),
                },
            });
            const disputeReference = `DISP_${Date.now()}_${(0, uuid_1.v4)().substring(0, 6)}`;
            this.logger.log(`Dispute opened successfully: ${disputeReference}`);
            return {
                success: true,
                message: 'Dispute opened successfully. Escrow funds have been frozen.',
                escrowId,
                disputeReference,
                disputeOpenedAt: disputedEscrow.disputeOpenedAt.toISOString(),
                estimatedResolutionTime: '3-5 business days',
            };
        }
        catch (error) {
            this.logger.error(`Failed to open dispute: ${error.message}`, error.stack);
            if (error instanceof payment_exception_1.EscrowException ||
                error instanceof payment_exception_1.UnauthorizedEscrowAccessException ||
                error instanceof payment_exception_1.InvalidEscrowStateException) {
                throw error;
            }
            throw new payment_exception_1.EscrowException('Failed to open dispute', 500, { originalError: error.message });
        }
    }
    async getUserEscrows(userId) {
        this.logger.log(`Fetching escrows for user ${userId}`);
        const escrows = await this.prisma.escrow.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
            },
            include: {
                buyer: { select: { id: true, firstName: true, lastName: true } },
                seller: { select: { id: true, firstName: true, lastName: true } },
                offer: { include: { listing: { select: { title: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const mappedEscrows = escrows.map(this.mapToEscrowResponse);
        const total = escrows.length;
        const active = escrows.filter(e => ['CREATED', 'FUNDED', 'DISPUTED'].includes(e.status)).length;
        const completed = escrows.filter(e => ['RELEASED', 'REFUNDED'].includes(e.status)).length;
        return {
            escrows: mappedEscrows,
            total,
            active,
            completed,
        };
    }
    async getEscrowById(escrowId, userId) {
        this.logger.log(`Fetching escrow ${escrowId} for user ${userId}`);
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
        });
        if (!escrow) {
            throw new payment_exception_1.EscrowException('Escrow not found', 404);
        }
        if (userId !== escrow.buyerId && userId !== escrow.sellerId) {
            throw new payment_exception_1.UnauthorizedEscrowAccessException();
        }
        return this.mapToEscrowResponse(escrow);
    }
    async autoReleaseExpiredEscrows() {
        this.logger.log('Processing auto-release for expired escrows');
        const expiredEscrows = await this.prisma.escrow.findMany({
            where: {
                status: 'FUNDED',
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        for (const escrow of expiredEscrows) {
            try {
                await this.releaseEscrow(escrow.id, 'SYSTEM', {
                    confirmCompletion: true,
                    reason: 'Auto-released after expiry period',
                });
                this.logger.log(`Auto-released escrow: ${escrow.reference}`);
            }
            catch (error) {
                this.logger.error(`Failed to auto-release escrow ${escrow.reference}: ${error.message}`);
            }
        }
    }
    mapToEscrowResponse(escrow) {
        return {
            id: escrow.id,
            reference: escrow.reference,
            amountInKobo: escrow.amountInKobo,
            feeInKobo: escrow.feeInKobo,
            status: escrow.status,
            description: escrow.description,
            releaseCondition: escrow.releaseCondition,
            buyerId: escrow.buyerId,
            sellerId: escrow.sellerId,
            offerId: escrow.offerId,
            expiresAt: escrow.expiresAt?.toISOString(),
            releasedAt: escrow.releasedAt?.toISOString(),
            disputeOpenedAt: escrow.disputeOpenedAt?.toISOString(),
            createdAt: escrow.createdAt.toISOString(),
            updatedAt: escrow.updatedAt.toISOString(),
        };
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = EscrowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map