import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsString, IsOptional, IsPhoneNumber, MinLength, MaxLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    description: 'Nigerian phone number in international format',
    example: '+2348012345678',
    pattern: '^\+234[789][01][0-9]{8}$'
  })
  @IsPhoneNumber('NG')
  phone: string

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string
}

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Adebayo Oladimeji',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiProperty({
    description: 'Nigerian phone number in international format',
    example: '+2348012345678',
    pattern: '^\+234[789][01][0-9]{8}$'
  })
  @IsPhoneNumber('NG')
  phone: string

  @ApiProperty({
    description: 'Email address',
    example: 'adebayo@example.com'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({
    description: 'Nigerian state/location',
    example: 'Lagos',
    enum: [
      'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City',
      'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu',
      'Abeokuta', 'Kaduna', 'Warri', 'Sokoto', 'Calabar', 'Akure', 'Bauchi'
    ]
  })
  @IsString()
  location: string

  @ApiPropertyOptional({
    description: 'Referral code from existing user',
    example: 'REF123456'
  })
  @IsOptional()
  @IsString()
  referralCode?: string
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string

  @ApiProperty({
    description: 'User information',
    type: () => UserResponseDto
  })
  user: UserResponseDto
}

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'usr_123456789'
  })
  id: string

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Adebayo Oladimeji'
  })
  fullName: string

  @ApiProperty({
    description: 'Nigerian phone number',
    example: '+2348012345678'
  })
  phone: string

  @ApiProperty({
    description: 'Email address',
    example: 'adebayo@example.com'
  })
  email: string

  @ApiProperty({
    description: 'Nigerian location',
    example: 'Lagos'
  })
  location: string

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://cdn.tradebybarter.ng/profiles/usr_123456789.jpg',
    nullable: true
  })
  profilePicture: string | null

  @ApiProperty({
    description: 'User verification status',
    example: true
  })
  isVerified: boolean

  @ApiProperty({
    description: 'User reputation score (0-100)',
    example: 95,
    minimum: 0,
    maximum: 100
  })
  reputationScore: number

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Last profile update timestamp',
    example: '2024-03-20T14:45:00Z'
  })
  updatedAt: Date
}

export class VerifyPhoneDto {
  @ApiProperty({
    description: 'Nigerian phone number to verify',
    example: '+2348012345678'
  })
  @IsPhoneNumber('NG')
  phone: string

  @ApiProperty({
    description: '6-digit verification code sent via SMS',
    example: '123456',
    pattern: '^[0-9]{6}$'
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  verificationCode: string
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Nigerian phone number',
    example: '+2348012345678'
  })
  @IsPhoneNumber('NG')
  phone: string

  @ApiProperty({
    description: '6-digit reset code sent via SMS',
    example: '654321'
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  resetCode: string

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  newPassword: string
}