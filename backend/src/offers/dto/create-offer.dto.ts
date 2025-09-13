import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsArray, IsDateString, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OfferType } from './offer-types';

export class CreateOfferDto {
  @ApiProperty({
    description: 'ID of the listing to make an offer on',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  listingId: string;

  @ApiProperty({
    description: 'Type of offer being made',
    enum: OfferType,
    example: OfferType.CASH,
  })
  @IsNotEmpty()
  @IsEnum(OfferType)
  type: OfferType;

  @ApiPropertyOptional({
    description: 'Cash amount in kobo (required for CASH and HYBRID offers)',
    example: 85000000,
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
    description: 'Optional message to accompany the offer',
    example: 'I am very interested in this item. Can we negotiate?',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  message?: string;

  @ApiPropertyOptional({
    description: 'Custom expiration date for the offer (default: 7 days from creation)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}