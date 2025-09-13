import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EscrowStatus {
  CREATED = 'CREATED',
  FUNDED = 'FUNDED',
  DISPUTED = 'DISPUTED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export class EscrowResponseDto {
  @ApiProperty({
    description: 'Escrow ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Escrow reference',
    example: 'ESC_1234567890',
  })
  reference: string;

  @ApiProperty({
    description: 'Escrow amount in kobo',
    example: 500000,
  })
  amountInKobo: number;

  @ApiProperty({
    description: 'Escrow service fee in kobo (2.5%)',
    example: 12500,
  })
  feeInKobo: number;

  @ApiProperty({
    description: 'Current escrow status',
    enum: EscrowStatus,
    example: EscrowStatus.CREATED,
  })
  status: EscrowStatus;

  @ApiPropertyOptional({
    description: 'Escrow description',
    example: 'Escrow for iPhone 13 trade',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Release condition',
    example: 'Both parties confirm trade completion',
  })
  releaseCondition?: string;

  @ApiProperty({
    description: 'Buyer user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  buyerId: string;

  @ApiProperty({
    description: 'Seller user ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  sellerId: string;

  @ApiProperty({
    description: 'Related offer ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  offerId: string;

  @ApiPropertyOptional({
    description: 'Auto-release date',
    example: '2023-12-08T10:00:00Z',
  })
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Release timestamp',
    example: '2023-12-01T16:00:00Z',
  })
  releasedAt?: string;

  @ApiPropertyOptional({
    description: 'Dispute opened timestamp',
    example: '2023-12-01T14:00:00Z',
  })
  disputeOpenedAt?: string;

  @ApiProperty({
    description: 'Escrow creation timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-01T12:00:00Z',
  })
  updatedAt: string;
}

export class EscrowListResponseDto {
  @ApiProperty({
    description: 'List of escrow accounts',
    type: [EscrowResponseDto],
  })
  escrows: EscrowResponseDto[];

  @ApiProperty({
    description: 'Total number of escrows',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Number of active escrows',
    example: 3,
  })
  active: number;

  @ApiProperty({
    description: 'Number of completed escrows',
    example: 7,
  })
  completed: number;
}