import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
import * as argon2 from 'argon2';
import { parsePhoneNumber } from 'libphonenumber-js';

export interface JwtPayload {
  sub: string;
  email: string;
  phoneNumber: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    displayName?: string | null;
    profileImageUrl?: string | null;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    city: string;
    state: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const { email, phoneNumber, password, ...userData } = signupDto;

    // Validate and format phone number
    const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber: formattedPhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.phoneNumber === formattedPhone) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate phone OTP
    const { otp, expiresAt } = this.generateOtp();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phoneNumber: formattedPhone,
        password: hashedPassword,
        phoneOtp: otp,
        phoneOtpExpiresAt: expiresAt,
        ...userData,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        displayName: true,
        profileImageUrl: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        city: true,
        state: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber);

    // Update user with refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // In a real application, send OTP via SMS
    console.log(`Phone verification OTP for ${formattedPhone}: ${otp}`);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { identifier, password } = loginDto;

    // Check if identifier is email or phone number
    const isEmail = identifier.includes('@');
    const whereClause = isEmail
      ? { email: identifier }
      : { phoneNumber: this.validateAndFormatPhoneNumber(identifier) };

    // Find user
    const user = await this.prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        password: true,
        firstName: true,
        lastName: true,
        displayName: true,
        profileImageUrl: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
        isBlocked: true,
        city: true,
        state: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Account is inactive or blocked');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber);

    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshTokenExpiresAtMs = this.parseJwtExpirationToSeconds(refreshTokenExpiresIn) * 1000;
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await this.hashRefreshToken(tokens.refreshToken),
        refreshTokenExpiresAt: new Date(Date.now() + refreshTokenExpiresAtMs),
        lastActiveAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { phoneNumber, otp } = verifyOtpDto;
    const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
      select: {
        id: true,
        phoneOtp: true,
        phoneOtpExpiresAt: true,
        isPhoneVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    if (!user.phoneOtp || !user.phoneOtpExpiresAt) {
      throw new BadRequestException('No OTP found for this phone number');
    }

    if (new Date() > user.phoneOtpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.phoneOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark phone as verified and clear OTP
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        phoneOtp: null,
        phoneOtpExpiresAt: null,
      },
    });

    return { message: 'Phone number verified successfully' };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    const { refreshToken } = refreshTokenDto;

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
        isActive: true,
        isBlocked: true,
      },
    });

    if (!user || !user.isActive || user.isBlocked) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (!user.refreshToken || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('No refresh token found');
    }

    if (new Date() > user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Verify the refresh token hash
    const isRefreshTokenValid = await argon2.verify(user.refreshToken, refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber);

    // Update user with new refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async resendOtp(phoneNumber: string): Promise<{ message: string }> {
    const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
      select: {
        id: true,
        isPhoneVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    // Generate new OTP
    const { otp, expiresAt } = this.generateOtp();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        phoneOtp: otp,
        phoneOtpExpiresAt: expiresAt,
      },
    });

    // In a real application, send OTP via SMS
    console.log(`Phone verification OTP for ${formattedPhone}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  private async generateTokens(userId: string, email: string, phoneNumber: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      phoneNumber,
    };

    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    const expiresInSeconds = this.parseJwtExpirationToSeconds(accessTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
    };
  }

  private parseJwtExpirationToSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));
    
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return parseInt(expiration);
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshTokenExpiresAtMs = this.parseJwtExpirationToSeconds(refreshTokenExpiresIn) * 1000;
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
        refreshTokenExpiresAt: new Date(Date.now() + refreshTokenExpiresAtMs),
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    return argon2.hash(refreshToken);
  }

  private validateAndFormatPhoneNumber(phoneNumber: string): string {
    try {
      const parsed = parsePhoneNumber(phoneNumber, 'NG');
      if (!parsed || !parsed.isValid()) {
        throw new BadRequestException('Invalid Nigerian phone number format');
      }
      return parsed.formatInternational();
    } catch (error) {
      throw new BadRequestException('Invalid Nigerian phone number format');
    }
  }

  private generateOtp(): { otp: string; expiresAt: Date } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return { otp, expiresAt };
  }
}