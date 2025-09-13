import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsArray, IsDateString, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OfferType } from './offer-types';

export class CounterOfferDto {
  @ApiProperty({
    description: 'Type of counteroffer being made',
    enum: OfferType,
    example: OfferType.HYBRID,
  })
  @IsNotEmpty()
  @IsEnum(OfferType)
  type: OfferType;

  @ApiPropertyOptional({
    description: 'Cash amount in kobo (required for CASH and HYBRID offers)',
    example: 75000000,
    minimum: 100,
    maximum: 100000000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100) // Minimum 1 Naira
  @Max(100000000000) // Maximum 1 billion Naira
  @Transform(({ value }) => parseInt(value))
  cashAmount?: number;

  @ApiPropertyOptional({
    description: 'Array of listing IDs being offered in exchange (required for SWAP and HYBRID offers)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  offeredListingIds?: string[];

  @ApiPropertyOptional({
    description: 'Message to accompany the counteroffer',
    example: 'Thanks for your offer! How about this counter-proposal?',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  message?: string;

  @ApiPropertyOptional({
    description: 'Custom expiration date for the counteroffer (default: 7 days from creation)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}