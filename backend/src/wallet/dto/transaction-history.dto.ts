import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class TransactionHistoryQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of transactions per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by transaction type',
    example: 'wallet_credit',
    enum: [
      'wallet_credit',
      'wallet_debit',
      'escrow_hold',
      'escrow_release',
      'payment_fee',
      'transfer_in',
      'transfer_out',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Filter by transaction status',
    example: 'completed',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class TransactionItemDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'txn_abc123def456',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction type',
    example: 'wallet_credit',
    enum: [
      'wallet_credit',
      'wallet_debit',
      'escrow_hold',
      'escrow_release',
      'payment_fee',
      'transfer_in',
      'transfer_out',
    ],
  })
  type: string;

  @ApiProperty({
    description: 'Transaction amount in kobo',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction amount in Naira (formatted)',
    example: '₦500.00',
  })
  amountFormatted: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'completed',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
  status: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Wallet topup via Paystack',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Reference or ID of related entity (offer, escrow, etc.)',
    example: 'off_def456ghi789',
    required: false,
  })
  referenceId?: string;

  @ApiProperty({
    description: 'Other user involved in the transaction',
    example: {
      id: 'usr_def456ghi789',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    },
    required: false,
  })
  otherUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}

export class TransactionHistoryResponseDto {
  @ApiProperty({
    description: 'List of transactions',
    type: [TransactionItemDto],
  })
  transactions: TransactionItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 145,
      totalPages: 8,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  @ApiProperty({
    description: 'Summary statistics for the current filter',
    example: {
      totalCredits: 500000,
      totalDebits: 350000,
      netAmount: 150000,
    },
  })
  summary: {
    totalCredits: number;
    totalDebits: number;
    netAmount: number;
  };
}