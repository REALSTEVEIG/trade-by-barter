import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletResponseDto, WalletInfoResponseDto, WalletStatsDto } from './dto/wallet-response.dto';
import { TransferFundsDto, TransferResponseDto } from './dto/transfer-funds.dto';
import {
  TransactionHistoryQueryDto,
  TransactionHistoryResponseDto,
  TransactionItemDto,
} from './dto/transaction-history.dto';
import {
  WalletException,
  WalletNotFoundedException,
  InsufficientFundsException,
  TransferException,
} from '../common/exceptions/payment.exception';
// Define enum values matching Prisma schema
const TransactionType = {
  WALLET_TOPUP: 'WALLET_TOPUP',
  WALLET_WITHDRAWAL: 'WALLET_WITHDRAWAL',
  ESCROW_DEPOSIT: 'ESCROW_DEPOSIT',
  ESCROW_RELEASE: 'ESCROW_RELEASE',
  ESCROW_REFUND: 'ESCROW_REFUND',
  TRANSFER_SENT: 'TRANSFER_SENT',
  TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
  PAYMENT_FEE: 'PAYMENT_FEE',
} as const;

const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

const EscrowStatus = {
  CREATED: 'CREATED',
  FUNDED: 'FUNDED',
  DISPUTED: 'DISPUTED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  EXPIRED: 'EXPIRED',
} as const;

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get wallet balance and information for a user
   */
  async getWalletInfo(userId: string): Promise<WalletInfoResponseDto> {
    this.logger.log(`Getting wallet info for user: ${userId}`);

    // Get or create wallet
    const wallet = await this.getOrCreateWallet(userId);

    // Get wallet statistics
    const stats = await this.getWalletStats(userId);

    const walletResponse: WalletResponseDto = {
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

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    query: TransactionHistoryQueryDto,
  ): Promise<TransactionHistoryResponseDto> {
    this.logger.log(`Getting transaction history for user: ${userId}, query:`, query);

    const { page = 1, limit = 20, type, status } = query;
    const skip = (page - 1) * limit;

    // Build where clause - user can be sender or receiver
    const whereClause: any = {
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

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: whereClause }),
    ]);

    // Calculate summary statistics
    const summary = await this.getTransactionSummary(userId, type, status);

    // Format transactions
    const formattedTransactions: TransactionItemDto[] = transactions.map((transaction) => {
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

  /**
   * Transfer funds between users
   */
  async transferFunds(fromUserId: string, transferData: TransferFundsDto): Promise<TransferResponseDto> {
    this.logger.log(`Transfer request from user: ${fromUserId} to ${transferData.recipientId}`);

    const { recipientId, amount, description } = transferData;

    // Validate recipient exists
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
      throw new TransferException('Recipient user not found', { recipientId });
    }

    // Can't transfer to self
    if (fromUserId === recipientId) {
      throw new TransferException('Cannot transfer funds to yourself', { senderId: fromUserId });
    }

    // Get sender user
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
      throw new WalletNotFoundedException(fromUserId);
    }

    // Get or create wallets
    const [senderWallet, recipientWallet] = await Promise.all([
      this.getOrCreateWallet(fromUserId),
      this.getOrCreateWallet(recipientId),
    ]);

    // Check sufficient balance
    if (senderWallet.balanceInKobo < amount) {
      throw new InsufficientFundsException(senderWallet.balanceInKobo, amount);
    }

    // Perform transfer in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create transfer transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.TRANSFER_SENT as any,
          amountInKobo: amount,
          status: TransactionStatus.COMPLETED as any,
          description: description || `Transfer to ${recipientUser.firstName} ${recipientUser.lastName}`,
          senderId: fromUserId,
          receiverId: recipientId,
        },
      });

      // Update sender wallet balance
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balanceInKobo: { decrement: amount } },
      });

      // Update recipient wallet balance
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

  /**
   * Get or create wallet for a user
   */
  async getOrCreateWallet(userId: string) {
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

  /**
   * Get wallet statistics
   */
  private async getWalletStats(userId: string): Promise<WalletStatsDto> {
    const [creditSum, debitSum, transactionCount, escrowAmount] = await Promise.all([
      // Total credits (money received)
      this.prisma.transaction.aggregate({
        where: {
          receiverId: userId,
          type: {
            in: [TransactionType.WALLET_TOPUP, TransactionType.TRANSFER_RECEIVED, TransactionType.ESCROW_RELEASE] as any,
          },
          status: TransactionStatus.COMPLETED as any,
        },
        _sum: { amountInKobo: true },
      }),
      // Total debits (money sent)
      this.prisma.transaction.aggregate({
        where: {
          senderId: userId,
          type: {
            in: [TransactionType.WALLET_WITHDRAWAL, TransactionType.TRANSFER_SENT, TransactionType.ESCROW_DEPOSIT] as any,
          },
          status: TransactionStatus.COMPLETED as any,
        },
        _sum: { amountInKobo: true },
      }),
      // Transaction count
      this.prisma.transaction.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ],
        },
      }),
      // Amount in escrow
      this.prisma.escrow.aggregate({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
          status: EscrowStatus.FUNDED as any,
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

  /**
   * Get transaction summary for filtering
   */
  private async getTransactionSummary(userId: string, type?: string, status?: string) {
    const baseWhere: any = {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ],
    };
    if (type) baseWhere.type = type;
    if (status) baseWhere.status = status;

    const [credits, debits] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          receiverId: userId, // Only count as credits when user is receiver
          type: {
            in: [TransactionType.WALLET_TOPUP, TransactionType.TRANSFER_RECEIVED, TransactionType.ESCROW_RELEASE] as any,
          },
        },
        _sum: { amountInKobo: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          senderId: userId, // Only count as debits when user is sender
          type: {
            in: [TransactionType.WALLET_WITHDRAWAL, TransactionType.TRANSFER_SENT, TransactionType.ESCROW_DEPOSIT] as any,
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

  /**
   * Format currency from kobo to Naira
   */
  private formatCurrency(amountInKobo: number): string {
    const naira = amountInKobo / 100;
    return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Update wallet balance (used by other services)
   */
  async updateWalletBalance(userId: string, amount: number, type: string, description?: string, referenceId?: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    await this.prisma.$transaction(async (tx) => {
      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceInKobo: amount > 0 ? { increment: amount } : { decrement: Math.abs(amount) }
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          type: type as any,
          amountInKobo: Math.abs(amount),
          status: TransactionStatus.COMPLETED as any,
          description: description || `Wallet ${amount > 0 ? 'credit' : 'debit'}`,
          senderId: amount > 0 ? 'system' : userId, // System for credits, user for debits
          receiverId: amount > 0 ? userId : 'system', // User for credits, system for debits
        },
      });
    });

    this.logger.log(`Wallet balance updated for user ${userId}: ${amount > 0 ? '+' : '-'}${this.formatCurrency(Math.abs(amount))}`);
  }
}