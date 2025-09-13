import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEscrowDto {
  @ApiProperty({
    description: 'ID of the accepted offer to create escrow for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  offerId: string;

  @ApiPropertyOptional({
    description: 'Optional description for the escrow',
    example: 'Escrow for iPhone 13 trade',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Custom escrow amount in kobo (overrides offer amount)',
    example: 500000,
    minimum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(10000, { message: 'Minimum escrow amount is ₦100 (10,000 kobo)' })
  @Type(() => Number)
  customAmountInKobo?: number;

  @ApiPropertyOptional({
    description: 'Release condition for the escrow',
    example: 'Both parties confirm trade completion',
  })
  @IsOptional()
  @IsString()
  releaseCondition?: string;
}