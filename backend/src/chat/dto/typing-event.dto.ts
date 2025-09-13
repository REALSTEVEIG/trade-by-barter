import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TypingStartDto {
  @ApiProperty({ description: 'Chat ID where user is typing' })
  @IsString()
  @IsUUID()
  chatId: string;

  @ApiPropertyOptional({ description: 'User ID who is typing (auto-filled from JWT)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  userId?: string;
}

export class TypingStopDto {
  @ApiProperty({ description: 'Chat ID where user stopped typing' })
  @IsString()
  @IsUUID()
  chatId: string;

  @ApiPropertyOptional({ description: 'User ID who stopped typing (auto-filled from JWT)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  userId?: string;
}

export class TypingEventDto {
  @ApiProperty({ description: 'Chat ID where typing event occurred' })
  @IsString()
  @IsUUID()
  chatId: string;

  @ApiProperty({ description: 'User ID who is typing/stopped typing' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Whether user is currently typing' })
  @IsBoolean()
  isTyping: boolean;

  @ApiProperty({ description: 'Timestamp of the typing event' })
  timestamp: Date;
}

export class UserPresenceDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Whether user is online' })
  @IsBoolean()
  isOnline: boolean;

  @ApiPropertyOptional({ description: 'Last seen timestamp if user is offline' })
  @IsOptional()
  lastSeen?: Date;

  @ApiPropertyOptional({ description: 'Current activity status' })
  @IsOptional()
  @IsString()
  status?: string; // 'online', 'away', 'busy', 'offline'
}

export class OnlineUsersDto {
  @ApiProperty({ description: 'Array of online user IDs', type: [String] })
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  onlineUserIds: string[];

  @ApiProperty({ description: 'Total count of online users' })
  totalOnline: number;
}