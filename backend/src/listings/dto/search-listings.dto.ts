import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ListingCategoryFilter {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  VEHICLES = 'VEHICLES',
  FURNITURE = 'FURNITURE',
  APPLIANCES = 'APPLIANCES',
  BOOKS = 'BOOKS',
  SPORTS = 'SPORTS',
  TOYS = 'TOYS',
  BEAUTY = 'BEAUTY',
  HOME_GARDEN = 'HOME_GARDEN',
  BOOKS_EDUCATION = 'BOOKS_EDUCATION',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  SPORTS_RECREATION = 'SPORTS_RECREATION',
  BABY_KIDS = 'BABY_KIDS',
  AGRICULTURE = 'AGRICULTURE',
  SERVICES = 'SERVICES',
  ART_CRAFTS = 'ART_CRAFTS',
  MUSICAL_INSTRUMENTS = 'MUSICAL_INSTRUMENTS',
  OTHER = 'OTHER',
}

export enum TradeTypeFilter {
  SWAP = 'swap',
  CASH = 'cash',
  HYBRID = 'hybrid',
}

export enum SortByFilter {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RELEVANCE = 'relevance',
  MOST_VIEWED = 'most_viewed',
}

export class SearchListingsDto {
  @IsOptional()
  @IsString()
  q?: string; // search query

  @IsOptional()
  @IsEnum(ListingCategoryFilter, { message: 'Invalid category' })
  category?: ListingCategoryFilter;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum price must be a valid number' })
  @Min(0, { message: 'Minimum price must be positive' })
  @Type(() => Number)
  minPrice?: number; // in kobo

  @IsOptional()
  @IsNumber({}, { message: 'Maximum price must be a valid number' })
  @Min(0, { message: 'Maximum price must be positive' })
  @Max(100000000, { message: 'Maximum price cannot exceed 1,000,000 Naira' })
  @Type(() => Number)
  maxPrice?: number; // in kobo

  @IsOptional()
  @IsString()
  location?: string; // Nigerian state or city

  @IsOptional()
  @IsEnum(TradeTypeFilter, { message: 'Invalid trade type' })
  tradeType?: TradeTypeFilter;

  @IsOptional()
  @IsEnum(SortByFilter, { message: 'Invalid sort option' })
  sortBy?: SortByFilter = SortByFilter.NEWEST;

  @IsOptional()
  @IsNumber({}, { message: 'Page must be a valid number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a valid number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  userId?: string; // Filter by specific user (for "my listings")
}