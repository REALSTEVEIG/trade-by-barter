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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payment_exception_1 = require("../common/exceptions/payment.exception");
const TransactionType = {
    WALLET_TOPUP: 'WALLET_TOPUP',
    WALLET_WITHDRAWAL: 'WALLET_WITHDRAWAL',
    ESCROW_DEPOSIT: 'ESCROW_DEPOSIT',
    ESCROW_RELEASE: 'ESCROW_RELEASE',
    ESCROW_REFUND: 'ESCROW_REFUND',
    TRANSFER_SENT: 'TRANSFER_SENT',
    TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
    PAYMENT_FEE: 'PAYMENT_FEE',
};
const TransactionStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
};
const EscrowStatus = {
    CREATED: 'CREATED',
    FUNDED: 'FUNDED',
    DISPUTED: 'DISPUTED',
    RELEASED: 'RELEASED',
    REFUNDED: 'REFUNDED',
    EXPIRED: 'EXPIRED',
};
let WalletService = WalletService_1 = class WalletService {
    prisma;
    logger = new common_1.Logger(WalletService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWalletInfo(userId) {
        this.logger.log(`Getting wallet info for user: ${userId}`);
        const wallet = await this.getOrCreateWallet(userId);
        const stats = await this.getWalletStats(userId);
        const walletResponse = {
            id: wallet.id,
            userId: wallet.userId,
            balance: wallet.balanceInKobo,
            balanceFormatted: this.formatCurrency(wallet.balanceInKobo),
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
        return {
            wallet: walletResponse,
            stats,
        };
    }
    async getTransactionHistory(userId, query) {
        this.logger.log(`Getting transaction history for user: ${userId}, query:`, query);
        const { page = 1, limit = 20, type, status } = query;
        const skip = (page - 1) * limit;
        const whereClause = {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ],
        };
        if (type) {
            whereClause.type = type;
        }
        if (status) {
            whereClause.status = status;
        }
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transaction.count({ where: whereClause }),
        ]);
        const summary = await this.getTransactionSummary(userId, type, status);
        const formattedTransactions = transactions.map((transaction) => {
            return {
                id: transaction.id,
                type: transaction.type,
                amount: transaction.amountInKobo,
                amountFormatted: this.formatCurrency(transaction.amountInKobo),
                status: transaction.status,
                description: transaction.description || undefined,
                referenceId: transaction.offerId || transaction.escrowId || transaction.paymentId || undefined,
                createdAt: transaction.createdAt,
            };
        });
        return {
            transactions: formattedTransactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            summary,
        };
    }
    async transferFunds(fromUserId, transferData) {
        this.logger.log(`Transfer request from user: ${fromUserId} to ${transferData.recipientId}`);
        const { recipientId, amount, description } = transferData;
        const recipientUser = await this.prisma.user.findUnique({
            where: { id: recipientId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        });
        if (!recipientUser) {
            throw new payment_exception_1.TransferException('Recipient user not found', { recipientId });
        }
        if (fromUserId === recipientId) {
            throw new payment_exception_1.TransferException('Cannot transfer funds to yourself', { senderId: fromUserId });
        }
        const senderUser = await this.prisma.user.findUnique({
            where: { id: fromUserId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        });
        if (!senderUser) {
            throw new payment_exception_1.WalletNotFoundedException(fromUserId);
        }
        const [senderWallet, recipientWallet] = await Promise.all([
            this.getOrCreateWallet(fromUserId),
            this.getOrCreateWallet(recipientId),
        ]);
        if (senderWallet.balanceInKobo < amount) {
            throw new payment_exception_1.InsufficientFundsException(senderWallet.balanceInKobo, amount);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    type: TransactionType.TRANSFER_SENT,
                    amountInKobo: amount,
                    status: TransactionStatus.COMPLETED,
                    description: description || `Transfer to ${recipientUser.firstName} ${recipientUser.lastName}`,
                    senderId: fromUserId,
                    receiverId: recipientId,
                },
            });
            await tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balanceInKobo: { decrement: amount } },
            });
            await tx.wallet.update({
                where: { id: recipientWallet.id },
                data: { balanceInKobo: { increment: amount } },
            });
            this.logger.log(`Transfer completed: ${this.formatCurrency(amount)} from ${fromUserId} to ${recipientId}`);
            return transaction;
        });
        return {
            id: result.id,
            status: result.status,
            amount: result.amountInKobo,
            amountFormatted: this.formatCurrency(result.amountInKobo),
            sender: senderUser,
            recipient: recipientUser,
            description: result.description || undefined,
            createdAt: result.createdAt,
        };
    }
    async getOrCreateWallet(userId) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            wallet = await this.prisma.wallet.create({
                data: {
                    userId,
                    balanceInKobo: 0,
                },
            });
            this.logger.log(`Created new wallet for user: ${userId}`);
        }
        return wallet;
    }
    async getWalletStats(userId) {
        const [creditSum, debitSum, transactionCount, escrowAmount] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: {
                    receiverId: userId,
                    type: {
                        in: [TransactionType.WALLET_TOPUP, TransactionType.TRANSFER_RECEIVED, TransactionType.ESCROW_RELEASE],
                    },
                    status: TransactionStatus.COMPLETED,
                },
                _sum: { amountInKobo: true },
            }),
            this.prisma.transaction.aggregate({
                where: {
                    senderId: userId,
                    type: {
                        in: [TransactionType.WALLET_WITHDRAWAL, TransactionType.TRANSFER_SENT, TransactionType.ESCROW_DEPOSIT],
                    },
                    status: TransactionStatus.COMPLETED,
                },
                _sum: { amountInKobo: true },
            }),
            this.prisma.transaction.count({
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ],
                },
            }),
            this.prisma.escrow.aggregate({
                where: {
                    OR: [{ buyerId: userId }, { sellerId: userId }],
                    status: EscrowStatus.FUNDED,
                },
                _sum: { amountInKobo: true },
            }),
        ]);
        return {
            totalReceived: creditSum._sum?.amountInKobo || 0,
            totalSent: debitSum._sum?.amountInKobo || 0,
            transactionCount,
            escrowAmount: escrowAmount._sum?.amountInKobo || 0,
        };
    }
    async getTransactionSummary(userId, type, status) {
        const baseWhere = {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ],
        };
        if (type)
            baseWhere.type = type;
        if (status)
            baseWhere.status = status;
        const [credits, debits] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: {
                    ...baseWhere,
                    receiverId: userId,
                    type: {
                        in: [TransactionType.WALLET_TOPUP, TransactionType.TRANSFER_RECEIVED, TransactionType.ESCROW_RELEASE],
                    },
                },
                _sum: { amountInKobo: true },
            }),
            this.prisma.transaction.aggregate({
                where: {
                    ...baseWhere,
                    senderId: userId,
                    type: {
                        in: [TransactionType.WALLET_WITHDRAWAL, TransactionType.TRANSFER_SENT, TransactionType.ESCROW_DEPOSIT],
                    },
                },
                _sum: { amountInKobo: true },
            }),
        ]);
        const totalCredits = credits._sum?.amountInKobo || 0;
        const totalDebits = debits._sum?.amountInKobo || 0;
        return {
            totalCredits,
            totalDebits,
            netAmount: totalCredits - totalDebits,
        };
    }
    formatCurrency(amountInKobo) {
        const naira = amountInKobo / 100;
        return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    async updateWalletBalance(userId, amount, type, description, referenceId) {
        const wallet = await this.getOrCreateWallet(userId);
        await this.prisma.$transaction(async (tx) => {
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balanceInKobo: amount > 0 ? { increment: amount } : { decrement: Math.abs(amount) }
                },
            });
            await tx.transaction.create({
                data: {
                    type: type,
                    amountInKobo: Math.abs(amount),
                    status: TransactionStatus.COMPLETED,
                    description: description || `Wallet ${amount > 0 ? 'credit' : 'debit'}`,
                    senderId: amount > 0 ? 'system' : userId,
                    receiverId: amount > 0 ? userId : 'system',
                },
            });
        });
        this.logger.log(`Wallet balance updated for user ${userId}: ${amount > 0 ? '+' : '-'}${this.formatCurrency(Math.abs(amount))}`);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map