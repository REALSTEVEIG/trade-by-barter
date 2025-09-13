import { IsString, IsEnum, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatType } from './chat-response.dto';

export class CreateChatDto {
  @ApiProperty({ 
    enum: ChatType,
    description: 'Type of chat to create',
    default: ChatType.DIRECT
  })
  @IsEnum(ChatType)
  type: ChatType = ChatType.DIRECT;

  @ApiProperty({ description: 'User ID of the chat recipient (for direct chats)' })
  @IsString()
  @IsUUID()
  recipientId: string;

  @ApiPropertyOptional({ description: 'Initial message to send when creating the chat' })
  @IsOptional()
  @IsString()
  initialMessage?: string;

  @ApiPropertyOptional({ description: 'Listing ID if this chat is related to a specific listing' })
  @IsOptional()
  @IsString()
  @IsUUID()
  listingId?: string;

  @ApiPropertyOptional({ description: 'Offer ID if this chat is related to a specific offer' })
  @IsOptional()
  @IsString()
  @IsUUID()
  offerId?: string;
}

export class CreateGroupChatDto {
  @ApiProperty({ description: 'Array of participant user IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  participantIds: string[];

  @ApiProperty({ description: 'Group chat name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Group chat description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Listing ID if this group chat is for a specific trade' })
  @IsOptional()
  @IsString()
  @IsUUID()
  listingId?: string;
}

export class JoinChatDto {
  @ApiProperty({ description: 'Chat ID to join' })
  @IsString()
  @IsUUID()
  chatId: string;
}

export class LeaveChatDto {
  @ApiProperty({ description: 'Chat ID to leave' })
  @IsString()
  @IsUUID()
  chatId: string;
}