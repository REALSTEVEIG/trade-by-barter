import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, Max, MaxLength } from 'class-validator'

export enum ListingCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum ListingStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  TRADED = 'traded',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export class CreateListingDto {
  @ApiProperty({
    description: 'Product title',
    example: 'iPhone 13 Pro Max 256GB - Space Gray',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  title: string

  @ApiProperty({
    description: 'Detailed product description',
    example: 'Excellent condition iPhone 13 Pro Max with original box, charger, and screen protector applied. Used for 6 months, no scratches or damages.',
    maxLength: 2000
  })
  @IsString()
  @MaxLength(2000)
  description: string

  @ApiProperty({
    description: 'Category ID',
    example: 'cat_electronics_001'
  })
  @IsString()
  categoryId: string

  @ApiProperty({
    description: 'Product condition',
    enum: ListingCondition,
    example: ListingCondition.LIKE_NEW
  })
  @IsEnum(ListingCondition)
  condition: ListingCondition

  @ApiProperty({
    description: 'Estimated value in Nigerian Naira',
    example: 450000,
    minimum: 1000,
    maximum: 50000000
  })
  @IsNumber()
  @Min(1000)
  @Max(50000000)
  estimatedValue: number

  @ApiProperty({
    description: 'Nigerian location for the item',
    example: 'Lagos Island, Lagos'
  })
  @IsString()
  location: string

  @ApiProperty({
    description: 'Array of image URLs',
    example: [
      'https://cdn.tradebybarter.ng/listings/img1.jpg',
      'https://cdn.tradebybarter.ng/listings/img2.jpg'
    ],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  images: string[]

  @ApiPropertyOptional({
    description: 'Items the owner is looking to trade for',
    example: 'MacBook Pro, gaming console, or cash equivalent',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lookingFor?: string

  @ApiPropertyOptional({
    description: 'Tags for better searchability',
    example: ['electronics', 'smartphone', 'apple', 'ios'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({
    description: 'Whether to allow cash offers',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowCashOffers?: boolean

  @ApiPropertyOptional({
    description: 'Whether to allow partial trades',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  allowPartialTrade?: boolean
}

export class UpdateListingDto {
  @ApiPropertyOptional({
    description: 'Product title',
    example: 'iPhone 13 Pro Max 256GB - Space Gray (Price Reduced!)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string

  @ApiPropertyOptional({
    description: 'Product description'
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({
    description: 'Product condition',
    enum: ListingCondition
  })
  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition

  @ApiPropertyOptional({
    description: 'Estimated value in Naira'
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(50000000)
  estimatedValue?: number

  @ApiPropertyOptional({
    description: 'What the owner is looking for'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lookingFor?: string

  @ApiPropertyOptional({
    description: 'Updated tags'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({
    description: 'Allow cash offers'
  })
  @IsOptional()
  @IsBoolean()
  allowCashOffers?: boolean

  @ApiPropertyOptional({
    description: 'Allow partial trades'
  })
  @IsOptional()
  @IsBoolean()
  allowPartialTrade?: boolean
}

export class ListingResponseDto {
  @ApiProperty({
    description: 'Unique listing identifier',
    example: 'lst_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Product title',
    example: 'iPhone 13 Pro Max 256GB - Space Gray'
  })
  title: string

  @ApiProperty({
    description: 'Product description',
    example: 'Excellent condition iPhone 13 Pro Max...'
  })
  description: string

  @ApiProperty({
    description: 'Category information',
    type: () => CategoryResponseDto
  })
  category: CategoryResponseDto

  @ApiProperty({
    description: 'Product condition',
    enum: ListingCondition,
    example: ListingCondition.LIKE_NEW
  })
  condition: ListingCondition

  @ApiProperty({
    description: 'Estimated value in Naira',
    example: 450000
  })
  estimatedValue: number

  @ApiProperty({
    description: 'Nigerian location',
    example: 'Lagos Island, Lagos'
  })
  location: string

  @ApiProperty({
    description: 'Array of image URLs',
    example: ['https://cdn.tradebybarter.ng/listings/img1.jpg']
  })
  images: string[]

  @ApiProperty({
    description: 'What owner is looking for',
    example: 'MacBook Pro or cash equivalent'
  })
  lookingFor: string

  @ApiProperty({
    description: 'Listing tags',
    example: ['electronics', 'smartphone']
  })
  tags: string[]

  @ApiProperty({
    description: 'Listing status',
    enum: ListingStatus,
    example: ListingStatus.ACTIVE
  })
  status: ListingStatus

  @ApiProperty({
    description: 'Owner information',
    type: () => UserSummaryDto
  })
  owner: UserSummaryDto

  @ApiProperty({
    description: 'Number of views',
    example: 245
  })
  viewCount: number

  @ApiProperty({
    description: 'Number of barter offers received',
    example: 12
  })
  offerCount: number

  @ApiProperty({
    description: 'Whether current user has favorited this listing',
    example: false
  })
  isFavorited: boolean

  @ApiProperty({
    description: 'Whether cash offers are allowed',
    example: true
  })
  allowCashOffers: boolean

  @ApiProperty({
    description: 'Whether partial trades are allowed',
    example: false
  })
  allowPartialTrade: boolean

  @ApiProperty({
    description: 'Listing creation timestamp',
    example: '2024-03-15T10:30:00Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-03-20T14:45:00Z'
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Listing expiry date',
    example: '2024-06-15T10:30:00Z'
  })
  expiresAt: Date
}

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'cat_electronics_001'
  })
  id: string

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics'
  })
  name: string

  @ApiProperty({
    description: 'Category icon URL',
    example: 'https://cdn.tradebybarter.ng/icons/electronics.svg'
  })
  icon: string
}

export class UserSummaryDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Full name',
    example: 'Adebayo Oladimeji'
  })
  fullName: string

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://cdn.tradebybarter.ng/profiles/usr_123456789.jpg'
  })
  profilePicture: string | null

  @ApiProperty({
    description: 'User location',
    example: 'Lagos'
  })
  location: string

  @ApiProperty({
    description: 'Reputation score',
    example: 95
  })
  reputationScore: number

  @ApiProperty({
    description: 'Whether user is verified',
    example: true
  })
  isVerified: boolean

  @ApiProperty({
    description: 'Member since date',
    example: '2024-01-15T10:30:00Z'
  })
  memberSince: Date
}

export class SearchListingsDto {
  @ApiPropertyOptional({
    description: 'Search query',
    example: 'iPhone MacBook electronics'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string

  @ApiPropertyOptional({
    description: 'Category ID to filter by',
    example: 'cat_electronics_001'
  })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiPropertyOptional({
    description: 'Nigerian location filter',
    example: 'Lagos'
  })
  @IsOptional()
  @IsString()
  location?: string

  @ApiPropertyOptional({
    description: 'Minimum price in Naira',
    example: 50000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number

  @ApiPropertyOptional({
    description: 'Maximum price in Naira',
    example: 500000
  })
  @IsOptional()
  @IsNumber()
  @Max(50000000)
  maxPrice?: number

  @ApiPropertyOptional({
    description: 'Product condition filter',
    enum: ListingCondition
  })
  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'price', 'views', 'offers']
  })
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number
}

export class PaginatedListingsDto {
  @ApiProperty({
    description: 'Array of listings',
    type: [ListingResponseDto]
  })
  data: ListingResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: () => PaginationMetaDto
  })
  meta: PaginationMetaDto
}

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number

  @ApiProperty({
    description: 'Items per page',
    example: 20
  })
  limit: number

  @ApiProperty({
    description: 'Total number of items',
    example: 150
  })
  total: number

  @ApiProperty({
    description: 'Total number of pages',
    example: 8
  })
  totalPages: number

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  hasNext: boolean

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  hasPrev: boolean
}