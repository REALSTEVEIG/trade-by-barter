import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType, OfferStatus } from './offer-types';
import type { UserSummary, ListingSummary } from './offer-types';

export class OfferResponse {
  @ApiProperty({
    description: 'Unique identifier for the offer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of offer',
    enum: OfferType,
    example: OfferType.CASH,
  })
  type: OfferType;

  @ApiProperty({
    description: 'Current status of the offer',
    enum: OfferStatus,
    example: OfferStatus.PENDING,
  })
  status: OfferStatus;

  @ApiPropertyOptional({
    description: 'Cash amount in kobo',
    example: 85000000,
  })
  cashAmount?: number;

  @ApiPropertyOptional({
    description: 'Formatted cash amount for display',
    example: '₦850,000',
  })
  displayCashAmount?: string;

  @ApiPropertyOptional({
    description: 'Message accompanying the offer',
    example: 'I am very interested in this item. Can we negotiate?',
  })
  message?: string;

  @ApiProperty({
    description: 'Offer expiration date',
    example: '2024-01-15T10:30:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Offer creation date',
    example: '2024-01-08T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Listing being offered on',
    type: Object,
  })
  listing: {
    id: string;
    title: string;
    owner: UserSummary;
  };

  @ApiProperty({
    description: 'User making the offer',
    type: Object,
  })
  offerer: UserSummary;

  @ApiPropertyOptional({
    description: 'Listings offered in exchange (for SWAP and HYBRID offers)',
    type: [Object],
  })
  offeredListings?: ListingSummary[];

  @ApiPropertyOptional({
    description: 'Parent offer ID for counteroffers',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  parentOfferId?: string;

  @ApiPropertyOptional({
    description: 'Array of counteroffers to this offer',
    type: [Object],
  })
  counterOffers?: OfferResponse[];

  @ApiProperty({
    description: 'Whether the current user is the offerer',
    example: true,
  })
  isOfferer: boolean;

  @ApiProperty({
    description: 'Whether the current user is the listing owner',
    example: false,
  })
  isListingOwner: boolean;
}

export class GetOffersResponse {
  @ApiProperty({
    description: 'Array of offers',
    type: [OfferResponse],
  })
  offers: OfferResponse[];

  @ApiProperty({
    description: 'Pagination information',
    type: Object,
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}