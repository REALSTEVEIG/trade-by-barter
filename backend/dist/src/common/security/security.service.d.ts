import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
export declare class SecurityService {
    private configService;
    private readonly logger;
    private readonly suspiciousPatterns;
    constructor(configService: ConfigService);
    validateNigerianPhone(phone: string): {
        isValid: boolean;
        isSuspicious: boolean;
        network?: string;
        reason?: string;
    };
    sanitizeInput(input: string): string;
    detectFraudulentContent(content: string): {
        isFraudulent: boolean;
        confidence: number;
        reasons: string[];
    };
    checkRateLimit(identifier: string, action: string, maxAttempts?: number, windowMs?: number): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
    }>;
    validateRequestOrigin(request: Request): {
        isValid: boolean;
        risk: 'low' | 'medium' | 'high';
        reasons: string[];
    };
    generateSecureToken(length?: number): string;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, storedHash: string): Promise<boolean>;
    encryptSensitiveData(data: string): {
        encrypted: string;
        iv: string;
    };
    decryptSensitiveData(encryptedData: string, iv: string): string;
    getSecurityHeaders(): Record<string, string>;
    logSecurityEvent(event: string, details: any, severity?: 'low' | 'medium' | 'high' | 'critical'): void;
    validateBusinessRegistration(rcNumber: string): {
        isValid: boolean;
        type: 'RC' | 'BN' | 'IT' | 'unknown';
        reasons: string[];
    };
}
