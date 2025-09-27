import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ListingCategoryFilter {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  VEHICLES = 'VEHICLES',
  HOME_GARDEN = 'HOME_GARDEN',
  BOOKS_MEDIA = 'BOOKS_MEDIA',
  BEAUTY_HEALTH = 'BEAUTY_HEALTH',
  SPORTS_RECREATION = 'SPORTS_RECREATION',
  AUTOMOTIVE = 'AUTOMOTIVE',
  TOYS_GAMES = 'TOYS_GAMES',
  JEWELRY_ACCESSORIES = 'JEWELRY_ACCESSORIES',
  ARTS_CRAFTS = 'ARTS_CRAFTS',
  MUSICAL_INSTRUMENTS = 'MUSICAL_INSTRUMENTS',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  TOOLS_EQUIPMENT = 'TOOLS_EQUIPMENT',
  SERVICES = 'SERVICES',
  HOME_APPLIANCES = 'HOME_APPLIANCES',
  PET_SUPPLIES = 'PET_SUPPLIES',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
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
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const categoryMap: Record<string, string> = {
        'Electronics': 'ELECTRONICS',
        'Fashion': 'FASHION',
        'Vehicles': 'VEHICLES',
        'Furniture': 'HOME_GARDEN',
        'Home & Garden': 'HOME_GARDEN',
        'Books & Media': 'BOOKS_MEDIA',
        'Beauty & Health': 'BEAUTY_HEALTH',
        'Sports & Recreation': 'SPORTS_RECREATION',
        'Automotive': 'AUTOMOTIVE',
        'Toys & Games': 'TOYS_GAMES',
        'Jewelry & Accessories': 'JEWELRY_ACCESSORIES',
        'Arts & Crafts': 'ARTS_CRAFTS',
        'Musical Instruments': 'MUSICAL_INSTRUMENTS',
        'Food & Beverages': 'FOOD_BEVERAGES',
        'Tools & Equipment': 'TOOLS_EQUIPMENT',
        'Services': 'SERVICES',
        'Home Appliances': 'HOME_APPLIANCES',
        'Pet Supplies': 'PET_SUPPLIES',
        'Office Supplies': 'OFFICE_SUPPLIES',
        'Other': 'OTHER'
      };
      
      return categoryMap[value] || value.toUpperCase().replace(/\s+/g, '_').replace(/&/g, '');
    }
    return value;
  })
  category?: string;

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
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  userId?: string; // Filter by specific user (for "my listings")

  @IsOptional()
  @IsUUID(4, { message: 'excludeUserId must be a valid UUID' })
  excludeUserId?: string; // Exclude listings from specific user
}