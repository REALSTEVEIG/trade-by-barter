import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserSummary {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  profileImageUrl?: string;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  isActive: boolean;
}

export class MessageSummary {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'LOCATION'] })
  messageType: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isRead: boolean;
}

export class ListingSummary {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  priceInKobo?: number;

  @ApiProperty()
  isSwapOnly: boolean;

  @ApiPropertyOptional()
  imageUrl?: string;
}

export enum ChatType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  TRADE = 'TRADE',
}

export class ChatResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ChatType })
  type: ChatType;

  @ApiProperty({ type: [UserSummary] })
  participants: UserSummary[];

  @ApiPropertyOptional({ type: MessageSummary })
  lastMessage?: MessageSummary;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  lastMessageAt: Date;

  @ApiProperty()
  isActive: boolean;

  // Trade-specific fields
  @ApiPropertyOptional()
  listingId?: string;

  @ApiPropertyOptional()
  offerId?: string;

  @ApiPropertyOptional({ type: ListingSummary })
  listing?: ListingSummary;
}