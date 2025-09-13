import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({
    description: 'Wallet ID',
    example: 'wlt_abc123def456',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the wallet',
    example: 'usr_def456ghi789',
  })
  userId: string;

  @ApiProperty({
    description: 'Current wallet balance in kobo (Nigerian currency)',
    example: 150000,
  })
  balance: number;

  @ApiProperty({
    description: 'Current wallet balance in Naira (formatted for display)',
    example: '₦1,500.00',
  })
  balanceFormatted: string;

  @ApiProperty({
    description: 'Wallet creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last wallet update date',
    example: '2024-01-15T14:45:00Z',
  })
  updatedAt: Date;
}

export class WalletStatsDto {
  @ApiProperty({
    description: 'Total amount received in kobo',
    example: 500000,
  })
  totalReceived: number;

  @ApiProperty({
    description: 'Total amount sent in kobo',
    example: 350000,
  })
  totalSent: number;

  @ApiProperty({
    description: 'Number of transactions',
    example: 25,
  })
  transactionCount: number;

  @ApiProperty({
    description: 'Amount in escrow in kobo',
    example: 75000,
  })
  escrowAmount: number;
}

export class WalletInfoResponseDto {
  @ApiProperty({
    description: 'Wallet information',
    type: WalletResponseDto,
  })
  wallet: WalletResponseDto;

  @ApiProperty({
    description: 'Wallet statistics',
    type: WalletStatsDto,
  })
  stats: WalletStatsDto;
}