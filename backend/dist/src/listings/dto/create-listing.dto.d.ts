export declare enum ListingCategory {
    ELECTRONICS = "ELECTRONICS",
    FASHION = "FASHION",
    HOME_APPLIANCES = "HOME_APPLIANCES",
    BOOKS = "BOOKS",
    SPORTS = "SPORTS",
    AUTOMOTIVE = "AUTOMOTIVE",
    BEAUTY = "BEAUTY",
    TOYS = "TOYS",
    JEWELRY = "JEWELRY",
    ARTS_CRAFTS = "ARTS_CRAFTS",
    MUSIC = "MUSIC",
    FOOD_BEVERAGES = "FOOD_BEVERAGES",
    TOOLS = "TOOLS",
    SERVICES = "SERVICES",
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
    acceptsCash?: boolean;
    acceptsSwap?: boolean;
    swapPreferences?: string[];
    city: string;
    state: string;
    specificLocation?: string;
}
