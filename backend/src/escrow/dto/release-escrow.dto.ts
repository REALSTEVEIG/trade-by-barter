import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseEscrowDto {
  @ApiPropertyOptional({
    description: 'Reason for releasing the escrow',
    example: 'Trade completed successfully',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Confirmation that trade is complete',
    example: true,
  })
  @IsBoolean()
  confirmCompletion: boolean;
}

export class ReleaseEscrowResponseDto {
  @ApiProperty({
    description: 'Whether escrow was released successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Escrow funds released successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Escrow ID that was released',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  escrowId: string;

  @ApiProperty({
    description: 'Amount released in kobo',
    example: 500000,
  })
  amountReleased: number;

  @ApiProperty({
    description: 'Recipient user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  recipientId: string;

  @ApiProperty({
    description: 'Release timestamp',
    example: '2023-12-01T16:00:00Z',
  })
  releasedAt: string;
}