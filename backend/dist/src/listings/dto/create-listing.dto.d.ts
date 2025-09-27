export declare enum ListingCategory {
    ELECTRONICS = "ELECTRONICS",
    FASHION = "FASHION",
    VEHICLES = "VEHICLES",
    HOME_GARDEN = "HOME_GARDEN",
    BOOKS_MEDIA = "BOOKS_MEDIA",
    SPORTS_RECREATION = "SPORTS_RECREATION",
    AUTOMOTIVE = "AUTOMOTIVE",
    BEAUTY_HEALTH = "BEAUTY_HEALTH",
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
