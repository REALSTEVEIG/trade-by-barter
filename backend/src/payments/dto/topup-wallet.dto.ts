import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// Payment method enum for validation
export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  MOBILE_MONEY = 'MOBILE_MONEY',
  USSD = 'USSD',
  WALLET = 'WALLET',
}

export class TopupWalletDto {
  @ApiProperty({
    description: 'Amount to top up in kobo (minimum 10,000 kobo = ₦100)',
    example: 500000,
    minimum: 10000,
    maximum: 50000000,
  })
  @IsInt()
  @Min(10000, { message: 'Minimum topup amount is ₦100 (10,000 kobo)' })
  @Max(50000000, { message: 'Maximum topup amount is ₦500,000 (50,000,000 kobo)' })
  @Type(() => Number)
  amountInKobo: number;

  @ApiProperty({
    description: 'Payment method for wallet topup',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Optional metadata for the payment',
    example: { source: 'wallet_topup', user_note: 'Monthly topup' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class TopupResponseDto {
  @ApiProperty({
    description: 'Payment reference for tracking',
    example: 'PAY_1234567890',
  })
  reference: string;

  @ApiProperty({
    description: 'Payment authorization URL for redirecting user',
    example: 'https://checkout.paystack.com/abcdef123456',
  })
  authorizationUrl: string;

  @ApiProperty({
    description: 'Payment access code',
    example: 'abcdef123456',
  })
  accessCode: string;

  @ApiProperty({
    description: 'Amount to be paid in kobo',
    example: 500000,
  })
  amountInKobo: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'NGN',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  paymentMethod: PaymentMethod;
}