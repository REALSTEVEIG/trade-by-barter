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
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const crypto_1 = require("crypto");
let SecurityService = SecurityService_1 = class SecurityService {
    configService;
    logger = new common_1.Logger(SecurityService_1.name);
    suspiciousPatterns;
    constructor(configService) {
        this.configService = configService;
        this.suspiciousPatterns = [
            /419[\s\-]?scam/i,
            /yahoo[\s\-]?boy/i,
            /advance[\s\-]?fee/i,
            /(union\s+select|drop\s+table|insert\s+into)/i,
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/i,
            /on\w+\s*=/i,
            /\+234\d{3}000\d{4}/i,
            /payment[\s\-]?pending/i,
            /verification[\s\-]?required/i,
            /account[\s\-]?suspended/i,
        ];
    }
    validateNigerianPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned.startsWith('234') || cleaned.length !== 13) {
            return {
                isValid: false,
                isSuspicious: false,
                reason: 'Invalid Nigerian phone format'
            };
        }
        const prefix = cleaned.substring(3, 6);
        const networks = {
            '803': 'MTN', '806': 'MTN', '813': 'MTN', '816': 'MTN', '810': 'MTN',
            '814': 'MTN', '903': 'MTN', '906': 'MTN', '915': 'MTN', '916': 'MTN',
            '805': 'Glo', '807': 'Glo', '815': 'Glo', '811': 'Glo',
            '908': 'Glo', '909': 'Glo', '901': 'Glo',
            '802': 'Airtel', '808': 'Airtel', '812': 'Airtel',
            '701': 'Airtel', '708': 'Airtel', '902': 'Airtel', '907': 'Airtel',
            '809': '9mobile', '905': '9mobile', '904': '9mobile',
        };
        const overlappingPrefixes = {
            '817': ['Glo', '9mobile'],
            '818': ['Glo', '9mobile'],
            '804': ['Airtel', '9mobile'],
        };
        let network = networks[prefix];
        if (!network && overlappingPrefixes[prefix]) {
            network = overlappingPrefixes[prefix][0];
        }
        if (!network) {
            return {
                isValid: false,
                isSuspicious: true,
                reason: 'Unknown network prefix - potential fraud'
            };
        }
        const zeroCount = (cleaned.match(/0/g) || []).length;
        if (zeroCount > 6) {
            return {
                isValid: true,
                isSuspicious: true,
                network,
                reason: 'Suspicious number pattern'
            };
        }
        return {
            isValid: true,
            isSuspicious: false,
            network
        };
    }
    sanitizeInput(input) {
        if (!input || typeof input !== 'string')
            return '';
        return input
            .trim()
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/[<>'"]/g, (match) => {
            const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
            return entities[match] || match;
        });
    }
    detectFraudulentContent(content) {
        const reasons = [];
        let suspiciousScore = 0;
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(content)) {
                suspiciousScore += 20;
                reasons.push('Contains known fraud pattern');
            }
        }
        const urgencyWords = /urgent|immediate|asap|emergency|critical/gi;
        const urgencyMatches = content.match(urgencyWords);
        if (urgencyMatches && urgencyMatches.length > 2) {
            suspiciousScore += 15;
            reasons.push('Excessive urgency language');
        }
        const moneySpam = /free\s+money|easy\s+cash|guaranteed\s+profit/gi;
        if (moneySpam.test(content)) {
            suspiciousScore += 25;
            reasons.push('Money-related spam detected');
        }
        const fakeContacts = /contact\s+me\s+via|whatsapp\s+me/gi;
        if (fakeContacts.test(content)) {
            suspiciousScore += 10;
            reasons.push('Suspicious contact pattern');
        }
        return {
            isFraudulent: suspiciousScore >= 30,
            confidence: Math.min(suspiciousScore / 100, 1),
            reasons
        };
    }
    async checkRateLimit(identifier, action, maxAttempts = 5, windowMs = 60000) {
        const key = `rate_limit:${identifier}:${action}`;
        return {
            allowed: true,
            remaining: maxAttempts - 1,
            resetTime: new Date(Date.now() + windowMs)
        };
    }
    validateRequestOrigin(request) {
        const reasons = [];
        let riskScore = 0;
        const userAgent = request.headers['user-agent'] || '';
        if (!userAgent || userAgent.length < 10) {
            riskScore += 30;
            reasons.push('Missing or suspicious User-Agent');
        }
        const acceptLanguage = request.headers['accept-language'] || '';
        if (!acceptLanguage.includes('en')) {
            riskScore += 10;
            reasons.push('Unusual language preference');
        }
        const xForwardedFor = request.headers['x-forwarded-for'];
        if (xForwardedFor && typeof xForwardedFor === 'string') {
            const proxies = xForwardedFor.split(',').length;
            if (proxies > 3) {
                riskScore += 20;
                reasons.push('Excessive proxy chain detected');
            }
        }
        const automationPatterns = /bot|crawler|spider|headless|phantom|selenium/i;
        if (automationPatterns.test(userAgent)) {
            riskScore += 40;
            reasons.push('Automation tool detected');
        }
        let risk = 'low';
        if (riskScore >= 50)
            risk = 'high';
        else if (riskScore >= 25)
            risk = 'medium';
        return {
            isValid: riskScore < 50,
            risk,
            reasons
        };
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    async hashPassword(password) {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.pbkdf2Sync)(password, salt, 10000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }
    async verifyPassword(password, storedHash) {
        const [salt, hash] = storedHash.split(':');
        const verifyHash = (0, crypto_1.pbkdf2Sync)(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }
    encryptSensitiveData(data) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(this.configService.get('ENCRYPTION_KEY') || crypto.randomBytes(32).toString('hex'), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            encrypted,
            iv: iv.toString('hex')
        };
    }
    decryptSensitiveData(encryptedData, iv) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(this.configService.get('ENCRYPTION_KEY') || crypto.randomBytes(32).toString('hex'), 'hex');
        const ivBuffer = Buffer.from(iv, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    getSecurityHeaders() {
        return {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' *.tradebybarter.ng *.paystack.co",
                "style-src 'self' 'unsafe-inline' *.tradebybarter.ng",
                "img-src 'self' data: *.tradebybarter.ng *.cloudflare.com",
                "connect-src 'self' *.tradebybarter.ng *.paystack.co api.paystack.co",
                "font-src 'self' *.tradebybarter.ng",
                "frame-src 'self' *.paystack.co",
                "upgrade-insecure-requests"
            ].join('; '),
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
            'X-Nigerian-Marketplace': 'TradeByBarter-v1.0'
        };
    }
    logSecurityEvent(event, details, severity = 'medium') {
        const logData = {
            timestamp: new Date().toISOString(),
            event,
            severity,
            details,
            marketplace: 'nigeria',
            timezone: 'Africa/Lagos'
        };
        switch (severity) {
            case 'critical':
                this.logger.error(`[SECURITY CRITICAL] ${event}`, logData);
                break;
            case 'high':
                this.logger.error(`[SECURITY HIGH] ${event}`, logData);
                break;
            case 'medium':
                this.logger.warn(`[SECURITY MEDIUM] ${event}`, logData);
                break;
            default:
                this.logger.log(`[SECURITY] ${event}`, logData);
        }
    }
    validateBusinessRegistration(rcNumber) {
        const reasons = [];
        const rcPattern = /^RC\d{6,7}$/i;
        const bnPattern = /^BN\d{6,7}$/i;
        const itPattern = /^IT\d{6,7}$/i;
        if (rcPattern.test(rcNumber)) {
            return { isValid: true, type: 'RC', reasons: [] };
        }
        else if (bnPattern.test(rcNumber)) {
            return { isValid: true, type: 'BN', reasons: [] };
        }
        else if (itPattern.test(rcNumber)) {
            return { isValid: true, type: 'IT', reasons: [] };
        }
        else {
            reasons.push('Invalid Nigerian business registration format');
            return { isValid: false, type: 'unknown', reasons };
        }
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityService);
//# sourceMappingURL=security.service.js.map