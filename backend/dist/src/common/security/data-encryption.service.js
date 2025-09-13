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
exports.DataEncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let DataEncryptionService = class DataEncryptionService {
    algorithm = 'aes-256-gcm';
    keyLength = 32;
    ivLength = 16;
    tagLength = 16;
    constructor() {
    }
    encrypt(text, secretKey) {
        try {
            const key = this.deriveKey(secretKey || process.env.ENCRYPTION_KEY || 'default-key-change-in-production');
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return {
                encrypted,
                iv: iv.toString('hex'),
            };
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    decrypt(encryptedData, secretKey) {
        try {
            const key = this.deriveKey(secretKey || process.env.ENCRYPTION_KEY || 'default-key-change-in-production');
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    async hashPassword(password, salt) {
        const finalSalt = salt || crypto.randomBytes(16).toString('hex');
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, finalSalt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    reject(err);
                resolve({
                    hash: derivedKey.toString('hex'),
                    salt: finalSalt,
                });
            });
        });
    }
    async verifyPassword(password, hash, salt) {
        const { hash: computedHash } = await this.hashPassword(password, salt);
        return computedHash === hash;
    }
    generateSecureToken(length = 6) {
        const digits = '0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, digits.length);
            token += digits[randomIndex];
        }
        return token;
    }
    encryptPII(data) {
        const encrypted = this.encrypt(data);
        return `${encrypted.encrypted}:${encrypted.iv}`;
    }
    decryptPII(encryptedData) {
        const [encrypted, iv] = encryptedData.split(':');
        return this.decrypt({ encrypted, iv });
    }
    deriveKey(password) {
        return crypto.scryptSync(password, 'tradebybarter-salt', this.keyLength);
    }
    generateSessionToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    hashData(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
};
exports.DataEncryptionService = DataEncryptionService;
exports.DataEncryptionService = DataEncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DataEncryptionService);
//# sourceMappingURL=data-encryption.service.js.map