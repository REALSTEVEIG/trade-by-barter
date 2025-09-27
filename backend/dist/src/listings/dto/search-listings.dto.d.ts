export declare enum ListingCategoryFilter {
    ELECTRONICS = "ELECTRONICS",
    FASHION = "FASHION",
    VEHICLES = "VEHICLES",
    HOME_GARDEN = "HOME_GARDEN",
    BOOKS_MEDIA = "BOOKS_MEDIA",
    HEALTH_BEAUTY = "HEALTH_BEAUTY",
    SPORTS_RECREATION = "SPORTS_RECREATION",
    BABY_KIDS = "BABY_KIDS",
    AUTOMOTIVE = "AUTOMOTIVE",
    TOYS_GAMES = "TOYS_GAMES",
    AGRICULTURE = "AGRICULTURE",
    SERVICES = "SERVICES",
    ART_CRAFTS = "ART_CRAFTS",
    MUSICAL_INSTRUMENTS = "MUSICAL_INSTRUMENTS",
    FURNITURE = "FURNITURE",
    APPLIANCES = "APPLIANCES",
    JEWELRY = "JEWELRY",
    FOOD_BEVERAGES = "FOOD_BEVERAGES",
    TOOLS = "TOOLS",
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
    category?: ListingCategoryFilter;
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
