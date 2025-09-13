export declare class UserSummary {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    profileImageUrl?: string;
    lastActiveAt: Date;
    isActive: boolean;
}
export declare class MessageSummary {
    id: string;
    content: string;
    messageType: string;
    senderId: string;
    createdAt: Date;
    isRead: boolean;
}
export declare class ListingSummary {
    id: string;
    title: string;
    priceInKobo?: number;
    isSwapOnly: boolean;
    imageUrl?: string;
}
export declare enum ChatType {
    DIRECT = "DIRECT",
    GROUP = "GROUP",
    TRADE = "TRADE"
}
export declare class ChatResponse {
    id: string;
    type: ChatType;
    participants: UserSummary[];
    lastMessage?: MessageSummary;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;
    isActive: boolean;
    listingId?: string;
    offerId?: string;
    listing?: ListingSummary;
}
