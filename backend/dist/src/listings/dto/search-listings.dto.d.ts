export declare enum ListingCategoryFilter {
    ELECTRONICS = "ELECTRONICS",
    FASHION = "FASHION",
    VEHICLES = "VEHICLES",
    FURNITURE = "FURNITURE",
    APPLIANCES = "APPLIANCES",
    BOOKS = "BOOKS",
    SPORTS = "SPORTS",
    TOYS = "TOYS",
    BEAUTY = "BEAUTY",
    HOME_GARDEN = "HOME_GARDEN",
    BOOKS_EDUCATION = "BOOKS_EDUCATION",
    HEALTH_BEAUTY = "HEALTH_BEAUTY",
    SPORTS_RECREATION = "SPORTS_RECREATION",
    BABY_KIDS = "BABY_KIDS",
    AGRICULTURE = "AGRICULTURE",
    SERVICES = "SERVICES",
    ART_CRAFTS = "ART_CRAFTS",
    MUSICAL_INSTRUMENTS = "MUSICAL_INSTRUMENTS",
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
}
