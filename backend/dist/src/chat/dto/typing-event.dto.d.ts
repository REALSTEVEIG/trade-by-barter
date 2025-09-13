export declare class TypingStartDto {
    chatId: string;
    userId?: string;
}
export declare class TypingStopDto {
    chatId: string;
    userId?: string;
}
export declare class TypingEventDto {
    chatId: string;
    userId: string;
    isTyping: boolean;
    timestamp: Date;
}
export declare class UserPresenceDto {
    userId: string;
    isOnline: boolean;
    lastSeen?: Date;
    status?: string;
}
export declare class OnlineUsersDto {
    onlineUserIds: string[];
    totalOnline: number;
}
