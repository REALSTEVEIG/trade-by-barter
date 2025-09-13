import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from './topup-wallet.dto';

export class WithdrawFundsDto {
  @ApiProperty({
    description: 'Amount to withdraw in kobo (minimum 100,000 kobo = ₦1,000)',
    example: 500000,
    minimum: 100000,
    maximum: 50000000,
  })
  @IsInt()
  @Min(100000, { message: 'Minimum withdrawal amount is ₦1,000 (100,000 kobo)' })
  @Max(50000000, { message: 'Maximum withdrawal amount is ₦500,000 (50,000,000 kobo)' })
  @Type(() => Number)
  amountInKobo: number;

  @ApiProperty({
    description: 'Withdrawal method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  withdrawalMethod: PaymentMethod;

  @ApiProperty({
    description: 'Bank account number for withdrawal',
    example: '0123456789',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Bank code for withdrawal',
    example: '044',
  })
  @IsString()
  bankCode: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'John Doe',
  })
  @IsString()
  accountName: string;

  @ApiPropertyOptional({
    description: 'Optional reason for withdrawal',
    example: 'Monthly expenses',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class WithdrawResponseDto {
  @ApiProperty({
    description: 'Withdrawal reference for tracking',
    example: 'WTH_1234567890',
  })
  reference: string;

  @ApiProperty({
    description: 'Withdrawal status',
    example: 'processing',
  })
  status: string;

  @ApiProperty({
    description: 'Amount being withdrawn in kobo',
    example: 500000,
  })
  amountInKobo: number;

  @ApiProperty({
    description: 'Processing fee in kobo',
    example: 5000,
  })
  feeInKobo: number;

  @ApiProperty({
    description: 'Net amount to be received in kobo',
    example: 495000,
  })
  netAmountInKobo: number;

  @ApiProperty({
    description: 'Estimated processing time',
    example: '1-3 business days',
  })
  estimatedProcessingTime: string;
}