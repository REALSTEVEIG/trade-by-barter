import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { WalletInfoResponseDto } from './dto/wallet-response.dto';
import { TransferFundsDto, TransferResponseDto } from './dto/transfer-funds.dto';
import {
  TransactionHistoryQueryDto,
  TransactionHistoryResponseDto,
} from './dto/transaction-history.dto';

@ApiTags('Wallet')
@Controller('api/v1/wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary: 'Get wallet balance and info',
    description: 'Get wallet balance, statistics, and account information for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet information retrieved successfully',
    type: WalletInfoResponseDto,
  })
  async getWalletInfo(
    @GetUser('id') userId: string,
  ): Promise<WalletInfoResponseDto> {
    this.logger.log(`Wallet info request from user: ${userId}`);
    return this.walletService.getWalletInfo(userId);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Get paginated transaction history for the authenticated user with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
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
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by transaction status',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: TransactionHistoryResponseDto,
  })
  async getTransactionHistory(
    @GetUser('id') userId: string,
    @Query() query: TransactionHistoryQueryDto,
  ): Promise<TransactionHistoryResponseDto> {
    this.logger.log(`Transaction history request from user: ${userId}, query:`, query);
    return this.walletService.getTransactionHistory(userId, query);
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Transfer funds between users',
    description: 'Transfer money from your wallet to another user\'s wallet',
  })
  @ApiResponse({
    status: 201,
    description: 'Transfer completed successfully',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or insufficient funds',
  })
  @ApiResponse({
    status: 404,
    description: 'Recipient user not found',
  })
  async transferFunds(
    @GetUser('id') userId: string,
    @Body() transferData: TransferFundsDto,
  ): Promise<TransferResponseDto> {
    this.logger.log(`Transfer request from user: ${userId} to ${transferData.recipientId}`);
    return this.walletService.transferFunds(userId, transferData);
  }
}