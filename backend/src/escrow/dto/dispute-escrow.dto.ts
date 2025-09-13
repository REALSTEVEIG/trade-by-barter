import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisputeEscrowDto {
  @ApiProperty({
    description: 'Reason for opening the dispute',
    example: 'Item not as described',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional details about the dispute',
    example: 'The iPhone received has a cracked screen which was not mentioned in the listing',
  })
  @IsOptional()
  @IsString()
  details?: string;
}

export class DisputeEscrowResponseDto {
  @ApiProperty({
    description: 'Whether dispute was opened successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Dispute opened successfully. Escrow funds have been frozen.',
  })
  message: string;

  @ApiProperty({
    description: 'Escrow ID that is disputed',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  escrowId: string;

  @ApiProperty({
    description: 'Dispute reference for tracking',
    example: 'DISP_1234567890',
  })
  disputeReference: string;

  @ApiProperty({
    description: 'Dispute opened timestamp',
    example: '2023-12-01T14:00:00Z',
  })
  disputeOpenedAt: string;

  @ApiProperty({
    description: 'Estimated resolution time',
    example: '3-5 business days',
  })
  estimatedResolutionTime: string;
}