import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, Max, MaxLength } from 'class-validator'
import { UserSummaryDto } from './listing.dto'

export enum OfferType {
  ITEM_FOR_ITEM = 'item_for_item',
  ITEM_PLUS_CASH = 'item_plus_cash',
  CASH_ONLY = 'cash_only',
  MULTIPLE_ITEMS = 'multiple_items'
}

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTER_OFFERED = 'counter_offered',
  EXPIRED = 'expired',
  WITHDRAWN = 'withdrawn'
}

export enum TransactionStatus {
  INITIATED = 'initiated',
  ITEMS_EXCHANGED = 'items_exchanged',
  PAYMENT_PENDING = 'payment_pending',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled'
}

export class CreateOfferDto {
  @ApiProperty({
    description: 'ID of the listing being offered on',
    example: 'lst_123456789'
  })
  @IsString()
  listingId: string

  @ApiProperty({
    description: 'Type of offer being made',
    enum: OfferType,
    example: OfferType.ITEM_FOR_ITEM
  })
  @IsEnum(OfferType)
  offerType: OfferType

  @ApiPropertyOptional({
    description: 'Cash amount in Naira (if applicable)',
    example: 50000,
    minimum: 0,
    maximum: 50000000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50000000)
  cashAmount?: number

  @ApiPropertyOptional({
    description: 'Items being offered in exchange',
    example: ['lst_987654321', 'lst_555666777'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  offeredItems?: string[]

  @ApiProperty({
    description: 'Detailed message explaining the offer',
    example: 'Hi! I would like to trade my MacBook Pro for your iPhone. It\'s in excellent condition with original packaging.',
    maxLength: 1000
  })
  @IsString()
  @MaxLength(1000)
  message: string

  @ApiPropertyOptional({
    description: 'Proposed meeting location in Nigeria',
    example: 'Computer Village, Ikeja, Lagos'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  proposedLocation?: string

  @ApiPropertyOptional({
    description: 'Whether offer expires automatically',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  autoExpire?: boolean

  @ApiPropertyOptional({
    description: 'Offer expiry in hours from creation',
    example: 72,
    minimum: 1,
    maximum: 168,
    default: 72
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  expiryHours?: number
}

export class UpdateOfferDto {
  @ApiPropertyOptional({
    description: 'Updated cash amount',
    minimum: 0,
    maximum: 50000000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50000000)
  cashAmount?: number

  @ApiPropertyOptional({
    description: 'Updated offer message',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string

  @ApiPropertyOptional({
    description: 'Updated meeting location'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  proposedLocation?: string
}

export class RespondToOfferDto {
  @ApiProperty({
    description: 'Response to the offer',
    enum: ['accept', 'reject', 'counter'],
    example: 'accept'
  })
  @IsEnum(['accept', 'reject', 'counter'])
  response: 'accept' | 'reject' | 'counter'

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Great offer! I accept your trade proposal.',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string

  @ApiPropertyOptional({
    description: 'Counter offer details (if response is counter)',
    type: () => CreateOfferDto
  })
  @IsOptional()
  counterOffer?: CreateOfferDto
}

export class ListingSummaryDto {
  @ApiProperty({
    description: 'Listing ID',
    example: 'lst_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Listing title',
    example: 'iPhone 13 Pro Max 256GB'
  })
  title: string

  @ApiProperty({
    description: 'Main image URL',
    example: 'https://cdn.tradebybarter.ng/listings/img1.jpg'
  })
  mainImage: string

  @ApiProperty({
    description: 'Estimated value in Naira',
    example: 450000
  })
  estimatedValue: number

  @ApiProperty({
    description: 'Item condition',
    example: 'like_new'
  })
  condition: string

  @ApiProperty({
    description: 'Owner location',
    example: 'Lagos'
  })
  location: string
}

export class OfferResponseDto {
  @ApiProperty({
    description: 'Unique offer identifier',
    example: 'off_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Listing being offered on',
    type: () => ListingSummaryDto
  })
  listing: ListingSummaryDto

  @ApiProperty({
    description: 'User making the offer',
    type: () => UserSummaryDto
  })
  offerer: UserSummaryDto

  @ApiProperty({
    description: 'Type of offer',
    enum: OfferType,
    example: OfferType.ITEM_FOR_ITEM
  })
  offerType: OfferType

  @ApiProperty({
    description: 'Cash amount involved (if any)',
    example: 50000,
    nullable: true
  })
  cashAmount: number | null

  @ApiProperty({
    description: 'Items offered in exchange',
    type: [ListingSummaryDto]
  })
  offeredItems: ListingSummaryDto[]

  @ApiProperty({
    description: 'Offer message',
    example: 'I would like to trade my MacBook for your iPhone'
  })
  message: string

  @ApiProperty({
    description: 'Proposed meeting location',
    example: 'Computer Village, Ikeja, Lagos'
  })
  proposedLocation: string

  @ApiProperty({
    description: 'Current offer status',
    enum: OfferStatus,
    example: OfferStatus.PENDING
  })
  status: OfferStatus

  @ApiProperty({
    description: 'Whether current user can respond to this offer',
    example: true
  })
  canRespond: boolean

  @ApiProperty({
    description: 'Offer creation timestamp',
    example: '2024-03-15T10:30:00Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Offer expiry timestamp',
    example: '2024-03-18T10:30:00Z'
  })
  expiresAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-03-16T14:45:00Z'
  })
  updatedAt: Date
}

export class TransactionDto {
  @ApiProperty({
    description: 'Unique transaction identifier',
    example: 'txn_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Accepted offer that initiated this transaction',
    type: () => OfferResponseDto
  })
  offer: OfferResponseDto

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.INITIATED
  })
  status: TransactionStatus

  @ApiProperty({
    description: 'Meeting details for exchange',
    type: () => MeetingDetailsDto
  })
  meetingDetails: MeetingDetailsDto

  @ApiProperty({
    description: 'Escrow information (if applicable)',
    type: () => EscrowDetailsDto,
    nullable: true
  })
  escrowDetails: EscrowDetailsDto | null

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-03-15T10:30:00Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Transaction completion timestamp',
    example: '2024-03-17T15:20:00Z',
    nullable: true
  })
  completedAt: Date | null

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-03-16T14:45:00Z'
  })
  updatedAt: Date
}

export class MeetingDetailsDto {
  @ApiProperty({
    description: 'Meeting location in Nigeria',
    example: 'Computer Village, Ikeja, Lagos'
  })
  location: string

  @ApiProperty({
    description: 'Scheduled meeting date and time',
    example: '2024-03-18T14:00:00Z'
  })
  scheduledAt: Date

  @ApiProperty({
    description: 'Safety tips and guidelines',
    example: [
      'Meet in a public place',
      'Bring a friend if possible',
      'Verify items before exchange'
    ]
  })
  safetyTips: string[]

  @ApiProperty({
    description: 'Contact information for coordination',
    type: () => ContactInfoDto
  })
  contactInfo: ContactInfoDto
}

export class ContactInfoDto {
  @ApiProperty({
    description: 'Masked phone numbers for safety',
    example: ['+234801***5678', '+234802***9012']
  })
  phoneNumbers: string[]

  @ApiProperty({
    description: 'Preferred contact method',
    example: 'WhatsApp',
    enum: ['WhatsApp', 'Phone', 'In-App']
  })
  preferredMethod: string
}

export class EscrowDetailsDto {
  @ApiProperty({
    description: 'Escrow service ID',
    example: 'esc_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Escrow fee in Naira',
    example: 2500
  })
  fee: number

  @ApiProperty({
    description: 'Items held in escrow',
    type: [ListingSummaryDto]
  })
  items: ListingSummaryDto[]

  @ApiProperty({
    description: 'Escrow status',
    example: 'holding',
    enum: ['initiated', 'holding', 'released', 'disputed']
  })
  status: string

  @ApiProperty({
    description: 'Expected release date',
    example: '2024-03-20T10:30:00Z'
  })
  releaseDate: Date
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Offer ID that was accepted',
    example: 'off_123456789'
  })
  @IsString()
  offerId: string

  @ApiProperty({
    description: 'Proposed meeting location',
    example: 'Computer Village, Ikeja, Lagos'
  })
  @IsString()
  @MaxLength(200)
  meetingLocation: string

  @ApiProperty({
    description: 'Proposed meeting date and time',
    example: '2024-03-18T14:00:00Z'
  })
  @IsString()
  scheduledAt: string

  @ApiPropertyOptional({
    description: 'Whether to use escrow service',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  useEscrow?: boolean

  @ApiPropertyOptional({
    description: 'Preferred contact method',
    example: 'WhatsApp',
    enum: ['WhatsApp', 'Phone', 'In-App']
  })
  @IsOptional()
  @IsString()
  preferredContact?: string
}

export class UpdateTransactionStatusDto {
  @ApiProperty({
    description: 'New transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.ITEMS_EXCHANGED
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus

  @ApiPropertyOptional({
    description: 'Additional notes about the status update',
    example: 'Items successfully exchanged. Both parties satisfied.',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}