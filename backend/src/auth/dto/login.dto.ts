import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address or phone number',
    example: 'john.doe@example.com',
  })
  @IsString()
  identifier: string; // Can be email or phone number

  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123!',
  })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Remember me for extended session',
    example: false,
    required: false,
  })
  @IsOptional()
  rememberMe?: boolean;
}