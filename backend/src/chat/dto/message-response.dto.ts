import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserSummary } from './chat-response.dto';

export class MediaAttachment {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  thumbnailUrl?: string;

  @ApiProperty()
  uploadedAt: Date;
}

export class ReadReceipt {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  readAt: Date;

  @ApiProperty({ type: UserSummary })
  user: UserSummary;
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

export class MessageResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty({ type: UserSummary })
  sender: UserSummary;

  @ApiProperty({ enum: MessageType })
  type: MessageType;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({ type: [MediaAttachment] })
  media?: MediaAttachment[];

  @ApiPropertyOptional({ description: 'Additional message metadata (location, contact info, etc.)' })
  metadata?: object;

  @ApiProperty({ enum: MessageStatus })
  status: MessageStatus;

  @ApiProperty()
  sentAt: Date;

  @ApiProperty({ type: [ReadReceipt] })
  readBy: ReadReceipt[];

  @ApiProperty()
  isRead: boolean;

  @ApiPropertyOptional()
  readAt?: Date;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MessageHistoryResponse {
  @ApiProperty({ type: [MessageResponse] })
  messages: MessageResponse[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;
}