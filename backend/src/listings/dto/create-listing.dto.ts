import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max, Length, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ListingCategory {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  VEHICLES = 'VEHICLES',
  HOME_GARDEN = 'HOME_GARDEN',
  BOOKS_MEDIA = 'BOOKS_MEDIA',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  SPORTS_RECREATION = 'SPORTS_RECREATION',
  BABY_KIDS = 'BABY_KIDS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  TOYS_GAMES = 'TOYS_GAMES',
  AGRICULTURE = 'AGRICULTURE',
  SERVICES = 'SERVICES',
  ART_CRAFTS = 'ART_CRAFTS',
  MUSICAL_INSTRUMENTS = 'MUSICAL_INSTRUMENTS',
  FURNITURE = 'FURNITURE',
  APPLIANCES = 'APPLIANCES',
  JEWELRY = 'JEWELRY',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  TOOLS = 'TOOLS',
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

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @Length(1, 2000, { message: 'Description must be between 1 and 2000 characters' })
  description?: string;

  @IsEnum(ListingCategory, { message: 'Invalid category' })
  category: ListingCategory;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @Length(1, 50)
  subcategory?: string;

  @IsEnum(ItemCondition, { message: 'Invalid condition' })
  condition: ItemCondition;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be a positive number' })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return undefined;
    // Convert Naira to kobo (multiply by 100)
    return Math.round(parsed * 100);
  })
  priceInKobo?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isSwapOnly?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCashOnly?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptsCash?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptsSwap?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return Array.isArray(value) ? value : [value];
  })
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
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @Length(1, 200)
  specificLocation?: string;
}