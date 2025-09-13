import { IsString, IsEnum, IsUUID, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from './message-response.dto';

export class UpdateMessageStatusDto {
  @ApiProperty({ description: 'Message ID to update status for' })
  @IsString()
  @IsUUID()
  messageId: string;

  @ApiProperty({ 
    enum: MessageStatus,
    description: 'New status for the message'
  })
  @IsEnum(MessageStatus)
  status: MessageStatus;

  @ApiPropertyOptional({ description: 'Timestamp when status changed' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class MessageDeliveredDto {
  @ApiProperty({ description: 'Message ID that was delivered' })
  @IsString()
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'User ID who received the message' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Delivery timestamp' })
  @IsDateString()
  deliveredAt: string;
}

export class MessageReadDto {
  @ApiProperty({ description: 'Message ID that was read' })
  @IsString()
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'User ID who read the message' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Read timestamp' })
  @IsDateString()
  readAt: string;
}

export class BulkMessageStatusDto {
  @ApiProperty({ description: 'Array of message IDs', type: [String] })
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  messageIds: string[];

  @ApiProperty({ 
    enum: MessageStatus,
    description: 'Status to apply to all messages'
  })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}