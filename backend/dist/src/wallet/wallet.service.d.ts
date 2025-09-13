import { PrismaService } from '../prisma/prisma.service';
import { WalletInfoResponseDto } from './dto/wallet-response.dto';
import { TransferFundsDto, TransferResponseDto } from './dto/transfer-funds.dto';
import { TransactionHistoryQueryDto, TransactionHistoryResponseDto } from './dto/transaction-history.dto';
export declare class WalletService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getWalletInfo(userId: string): Promise<WalletInfoResponseDto>;
    getTransactionHistory(userId: string, query: TransactionHistoryQueryDto): Promise<TransactionHistoryResponseDto>;
    transferFunds(fromUserId: string, transferData: TransferFundsDto): Promise<TransferResponseDto>;
    getOrCreateWallet(userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        balanceInKobo: number;
        escrowBalanceInKobo: number;
        totalEarnedInKobo: number;
        totalSpentInKobo: number;
        pin: string | null;
        lastTransactionAt: Date | null;
        userId: string;
    }>;
    private getWalletStats;
    private getTransactionSummary;
    private formatCurrency;
    updateWalletBalance(userId: string, amount: number, type: string, description?: string, referenceId?: string): Promise<void>;
}
