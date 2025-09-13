import { IsString, IsEnum, IsOptional, IsObject, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from './message-response.dto';

export class SendMessageDto {
  @ApiProperty({ description: 'Chat ID to send message to' })
  @IsString()
  @IsUUID()
  chatId: string;

  @ApiProperty({ 
    enum: MessageType,
    description: 'Type of message being sent',
    default: MessageType.TEXT
  })
  @IsEnum(MessageType)
  type: MessageType = MessageType.TEXT;

  @ApiProperty({ 
    description: 'Message content',
    minLength: 1,
    maxLength: 10000
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @ApiPropertyOptional({ description: 'Media URL for image/video/audio/document messages' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for special message types (location coordinates, contact info, etc.)',
    example: { latitude: 6.5244, longitude: 3.3792, address: 'Lagos, Nigeria' }
  })
  @IsOptional()
  @IsObject()
  metadata?: object;
}

export class SendTextMessageDto {
  @ApiProperty({ description: 'Chat ID to send message to' })
  @IsString()
  @IsUUID()
  chatId: string;

  @ApiProperty({ 
    description: 'Text message content',
    minLength: 1,
    maxLength: 10000
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;
}

export class SendLocationMessageDto {
  @ApiProperty({ description: 'Chat ID to send message to' })
  @IsString()
  @IsUUID()
  chatId: string;

  @ApiProperty({ description: 'Location latitude' })
  latitude: number;

  @ApiProperty({ description: 'Location longitude' })
  longitude: number;

  @ApiPropertyOptional({ description: 'Human readable address' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class MarkMessageReadDto {
  @ApiProperty({ description: 'Message ID to mark as read' })
  @IsString()
  @IsUUID()
  messageId: string;
}

export class BulkMarkReadDto {
  @ApiProperty({ description: 'Array of message IDs to mark as read', type: [String] })
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  messageIds: string[];
}