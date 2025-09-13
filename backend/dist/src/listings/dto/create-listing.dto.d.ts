export declare enum ListingCategory {
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
export declare enum ItemCondition {
    NEW = "NEW",
    LIKE_NEW = "LIKE_NEW",
    GOOD = "GOOD",
    FAIR = "FAIR",
    POOR = "POOR"
}
export declare class CreateListingDto {
    title: string;
    description: string;
    category: ListingCategory;
    subcategory?: string;
    condition: ItemCondition;
    priceInKobo?: number;
    isSwapOnly?: boolean;
    acceptsCash?: boolean;
    acceptsSwap?: boolean;
    swapPreferences?: string[];
    city: string;
    state: string;
    specificLocation?: string;
}
