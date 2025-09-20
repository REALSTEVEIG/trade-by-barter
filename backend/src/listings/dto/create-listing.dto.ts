import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max, Length, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ListingCategory {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  HOME_APPLIANCES = 'HOME_APPLIANCES',
  BOOKS = 'BOOKS',
  SPORTS = 'SPORTS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  BEAUTY = 'BEAUTY',
  TOYS = 'TOYS',
  JEWELRY = 'JEWELRY',
  ARTS_CRAFTS = 'ARTS_CRAFTS',
  MUSIC = 'MUSIC',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  TOOLS = 'TOOLS',
  SERVICES = 'SERVICES',
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
  @Max(100000000, { message: 'Price cannot exceed 1,000,000 Naira' }) // 100M kobo = 1M Naira
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
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