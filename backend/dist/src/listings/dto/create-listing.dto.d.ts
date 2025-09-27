export declare enum ListingCategory {
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
export declare enum ItemCondition {
    NEW = "NEW",
    LIKE_NEW = "LIKE_NEW",
    GOOD = "GOOD",
    FAIR = "FAIR",
    POOR = "POOR"
}
export declare class CreateListingDto {
    title: string;
    description?: string;
    category: ListingCategory;
    subcategory?: string;
    condition: ItemCondition;
    priceInKobo?: number;
    isSwapOnly?: boolean;
    isCashOnly?: boolean;
    acceptsCash?: boolean;
    acceptsSwap?: boolean;
    swapPreferences?: string[];
    city: string;
    state: string;
    specificLocation?: string;
}
