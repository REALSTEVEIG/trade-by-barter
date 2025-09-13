import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferFundsDto {
  @ApiProperty({
    description: 'ID of the recipient user',
    example: 'usr_def456ghi789',
  })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({
    description: 'Amount to transfer in kobo (Nigerian currency)',
    example: 50000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100, { message: 'Minimum transfer amount is ₦1.00 (100 kobo)' })
  amount: number;

  @ApiProperty({
    description: 'Optional description for the transfer',
    example: 'Payment for laptop purchase',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class TransferResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'txn_abc123def456',
  })
  id: string;

  @ApiProperty({
    description: 'Transfer status',
    example: 'completed',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
  status: string;

  @ApiProperty({
    description: 'Amount transferred in kobo',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Amount transferred in Naira (formatted)',
    example: '₦500.00',
  })
  amountFormatted: string;

  @ApiProperty({
    description: 'Sender user information',
    example: {
      id: 'usr_abc123def456',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  })
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Recipient user information',
    example: {
      id: 'usr_def456ghi789',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    },
  })
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Transfer description',
    example: 'Payment for laptop purchase',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}