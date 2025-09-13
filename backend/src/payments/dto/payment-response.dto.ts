import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from './topup-wallet.dto';

export class PaymentMethodResponseDto {
  @ApiProperty({
    description: 'Payment method identifier',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Payment method display name',
    example: 'Card Payment',
  })
  displayName: string;

  @ApiProperty({
    description: 'Whether method is currently available',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Processing fee percentage',
    example: 1.5,
  })
  feePercentage: number;

  @ApiPropertyOptional({
    description: 'Additional method-specific information',
    example: 'Supports Visa and Mastercard',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Minimum transaction amount in kobo',
    example: 10000,
  })
  minimumAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum transaction amount in kobo',
    example: 50000000,
  })
  maximumAmount?: number;
}

export class PaymentStatusResponseDto {
  @ApiProperty({
    description: 'Payment reference',
    example: 'PAY_1234567890',
  })
  reference: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Amount paid in kobo',
    example: 500000,
  })
  amountInKobo: number;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment completion timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  paidAt: string;

  @ApiPropertyOptional({
    description: 'Transaction fees in kobo',
    example: 7500,
  })
  feeInKobo?: number;

  @ApiPropertyOptional({
    description: 'Payment gateway response',
    example: 'Approved by Financial Institution',
  })
  gatewayResponse?: string;

  @ApiPropertyOptional({
    description: 'Authorization code for card payments',
    example: 'AUTH_abcdef123',
  })
  authorizationCode?: string;
}

export class NigerianBankDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Guaranty Trust Bank',
  })
  name: string;

  @ApiProperty({
    description: 'Bank code',
    example: '058',
  })
  code: string;

  @ApiProperty({
    description: 'Bank slug identifier',
    example: 'gtbank',
  })
  slug: string;

  @ApiProperty({
    description: 'Whether bank supports USSD',
    example: true,
  })
  supportsUssd: boolean;

  @ApiProperty({
    description: 'Whether bank supports transfers',
    example: true,
  })
  supportsTransfer: boolean;
}