export declare enum ListingCategoryFilter {
    ELECTRONICS = "ELECTRONICS",
    FASHION = "FASHION",
    VEHICLES = "VEHICLES",
    HOME_GARDEN = "HOME_GARDEN",
    BOOKS_MEDIA = "BOOKS_MEDIA",
    BEAUTY_HEALTH = "BEAUTY_HEALTH",
    SPORTS_RECREATION = "SPORTS_RECREATION",
    AUTOMOTIVE = "AUTOMOTIVE",
    TOYS_GAMES = "TOYS_GAMES",
    JEWELRY_ACCESSORIES = "JEWELRY_ACCESSORIES",
    ARTS_CRAFTS = "ARTS_CRAFTS",
    MUSICAL_INSTRUMENTS = "MUSICAL_INSTRUMENTS",
    FOOD_BEVERAGES = "FOOD_BEVERAGES",
    TOOLS_EQUIPMENT = "TOOLS_EQUIPMENT",
    SERVICES = "SERVICES",
    HOME_APPLIANCES = "HOME_APPLIANCES",
    PET_SUPPLIES = "PET_SUPPLIES",
    OFFICE_SUPPLIES = "OFFICE_SUPPLIES",
    OTHER = "OTHER"
}
export declare enum TradeTypeFilter {
    SWAP = "swap",
    CASH = "cash",
    HYBRID = "hybrid"
}
export declare enum SortByFilter {
    NEWEST = "newest",
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    RELEVANCE = "relevance",
    MOST_VIEWED = "most_viewed"
}
export declare class SearchListingsDto {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    tradeType?: TradeTypeFilter;
    sortBy?: SortByFilter;
    page?: number;
    limit?: number;
    userId?: string;
    excludeUserId?: string;
}
