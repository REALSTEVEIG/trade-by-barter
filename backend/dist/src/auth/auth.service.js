"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2 = __importStar(require("argon2"));
const libphonenumber_js_1 = require("libphonenumber-js");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async signup(signupDto) {
        const { email, phoneNumber, password, ...userData } = signupDto;
        const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { phoneNumber: formattedPhone }],
            },
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            if (existingUser.phoneNumber === formattedPhone) {
                throw new common_1.ConflictException('User with this phone number already exists');
            }
        }
        const hashedPassword = await this.hashPassword(password);
        const { otp, expiresAt } = this.generateOtp();
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
        const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        console.log(`Phone verification OTP for ${formattedPhone}: ${otp}`);
        return {
            user,
            ...tokens,
        };
    }
    async login(loginDto) {
        const { identifier, password } = loginDto;
        const isEmail = identifier.includes('@');
        const whereClause = isEmail
            ? { email: identifier }
            : { phoneNumber: this.validateAndFormatPhoneNumber(identifier) };
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive || user.isBlocked) {
            throw new common_1.UnauthorizedException('Account is inactive or blocked');
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: await this.hashRefreshToken(tokens.refreshToken),
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                lastActiveAt: new Date(),
            },
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }
    async verifyOtp(verifyOtpDto) {
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
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isPhoneVerified) {
            throw new common_1.BadRequestException('Phone number is already verified');
        }
        if (!user.phoneOtp || !user.phoneOtpExpiresAt) {
            throw new common_1.BadRequestException('No OTP found for this phone number');
        }
        if (new Date() > user.phoneOtpExpiresAt) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        if (user.phoneOtp !== otp) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
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
    async refreshTokens(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
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
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        if (!user.refreshToken || !user.refreshTokenExpiresAt) {
            throw new common_1.UnauthorizedException('No refresh token found');
        }
        if (new Date() > user.refreshTokenExpiresAt) {
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        const isRefreshTokenValid = await argon2.verify(user.refreshToken, refreshToken);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: null,
                refreshTokenExpiresAt: null,
            },
        });
        return { message: 'Logged out successfully' };
    }
    async resendOtp(phoneNumber) {
        const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: formattedPhone },
            select: {
                id: true,
                isPhoneVerified: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isPhoneVerified) {
            throw new common_1.BadRequestException('Phone number is already verified');
        }
        const { otp, expiresAt } = this.generateOtp();
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                phoneOtp: otp,
                phoneOtpExpiresAt: expiresAt,
            },
        });
        console.log(`Phone verification OTP for ${formattedPhone}: ${otp}`);
        return { message: 'OTP sent successfully' };
    }
    async generateTokens(userId, email, phoneNumber) {
        const payload = {
            sub: userId,
            email,
            phoneNumber,
        };
        const accessTokenExpiresIn = 15 * 60;
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60;
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: accessTokenExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: refreshTokenExpiresIn,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            expiresIn: accessTokenExpiresIn,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = await this.hashRefreshToken(refreshToken);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: hashedRefreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }
    async hashPassword(password) {
        return argon2.hash(password);
    }
    async hashRefreshToken(refreshToken) {
        return argon2.hash(refreshToken);
    }
    validateAndFormatPhoneNumber(phoneNumber) {
        try {
            const parsed = (0, libphonenumber_js_1.parsePhoneNumber)(phoneNumber, 'NG');
            if (!parsed || !parsed.isValid()) {
                throw new common_1.BadRequestException('Invalid Nigerian phone number format');
            }
            return parsed.formatInternational();
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid Nigerian phone number format');
        }
    }
    generateOtp() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        return { otp, expiresAt };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map