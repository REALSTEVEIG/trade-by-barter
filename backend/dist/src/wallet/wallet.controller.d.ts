import { WalletService } from './wallet.service';
import { WalletInfoResponseDto } from './dto/wallet-response.dto';
import { TransferFundsDto, TransferResponseDto } from './dto/transfer-funds.dto';
import { TransactionHistoryQueryDto, TransactionHistoryResponseDto } from './dto/transaction-history.dto';
export declare class WalletController {
    private readonly walletService;
    private readonly logger;
    constructor(walletService: WalletService);
    getWalletInfo(userId: string): Promise<WalletInfoResponseDto>;
    getTransactionHistory(userId: string, query: TransactionHistoryQueryDto): Promise<TransactionHistoryResponseDto>;
    transferFunds(userId: string, transferData: TransferFundsDto): Promise<TransferResponseDto>;
}
