import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max, Length, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ListingCategory {
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

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export class CreateListingDto {
  @IsString()
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters' })
  title: string;

  @IsString()
  @Length(10, 2000, { message: 'Description must be between 10 and 2000 characters' })
  description: string;

  @IsEnum(ListingCategory, { message: 'Invalid category' })
  category: ListingCategory;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  subcategory?: string;

  @IsEnum(ItemCondition, { message: 'Invalid condition' })
  condition: ItemCondition;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be a positive number' })
  @Max(100000000, { message: 'Price cannot exceed 1,000,000 Naira' }) // 100M kobo = 1M Naira
  @Transform(({ value }) => parseInt(value) || 0)
  priceInKobo?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isSwapOnly?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptsCash?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptsSwap?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Maximum 10 swap preferences allowed' })
  swapPreferences?: string[] = [];

  @IsString()
  @Length(1, 50, { message: 'City is required' })
  city: string;

  @IsString()
  @Length(1, 50, { message: 'State is required' })
  state: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  specificLocation?: string;
}