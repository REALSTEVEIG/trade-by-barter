import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { createHash, pbkdf2Sync, randomBytes } from 'crypto'
import { Request } from 'express'

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name)
  private readonly suspiciousPatterns: RegExp[]

  constructor(private configService: ConfigService) {
    // Nigerian-specific security patterns
    this.suspiciousPatterns = [
      // Common Nigerian fraud patterns
      /419[\s\-]?scam/i,
      /yahoo[\s\-]?boy/i,
      /advance[\s\-]?fee/i,
      
      // SQL injection patterns
      /(union\s+select|drop\s+table|insert\s+into)/i,
      
      // XSS patterns
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      
      // Nigerian phone number fraud patterns
      /\+234\d{3}000\d{4}/i, // Fake numbers pattern
      
      // Common marketplace scam phrases
      /payment[\s\-]?pending/i,
      /verification[\s\-]?required/i,
      /account[\s\-]?suspended/i,
    ]
  }

  /**
   * Validate Nigerian phone number security
   */
  validateNigerianPhone(phone: string): {
    isValid: boolean
    isSuspicious: boolean
    network?: string
    reason?: string
  } {
    const cleaned = phone.replace(/\D/g, '')
    
    // Must start with 234 and be 13 digits
    if (!cleaned.startsWith('234') || cleaned.length !== 13) {
      return {
        isValid: false,
        isSuspicious: false,
        reason: 'Invalid Nigerian phone format'
      }
    }

    const prefix = cleaned.substring(3, 6)
    
    // Known Nigerian network prefixes
    const networks: Record<string, string> = {
      // MTN
      '803': 'MTN', '806': 'MTN', '813': 'MTN', '816': 'MTN', '810': 'MTN',
      '814': 'MTN', '903': 'MTN', '906': 'MTN', '915': 'MTN', '916': 'MTN',
      
      // Glo
      '805': 'Glo', '807': 'Glo', '815': 'Glo', '811': 'Glo',
      '908': 'Glo', '909': 'Glo', '901': 'Glo',
      
      // Airtel
      '802': 'Airtel', '808': 'Airtel', '812': 'Airtel',
      '701': 'Airtel', '708': 'Airtel', '902': 'Airtel', '907': 'Airtel',
      
      // 9mobile (avoiding duplicates)
      '809': '9mobile', '905': '9mobile', '904': '9mobile',
    }
    
    // Handle overlapping prefixes
    const overlappingPrefixes: Record<string, string[]> = {
      '817': ['Glo', '9mobile'],
      '818': ['Glo', '9mobile'],
      '804': ['Airtel', '9mobile'],
    }

    let network = networks[prefix]
    
    // Handle overlapping prefixes
    if (!network && overlappingPrefixes[prefix]) {
      network = overlappingPrefixes[prefix][0] // Use first network for overlapping
    }
    
    if (!network) {
      return {
        isValid: false,
        isSuspicious: true,
        reason: 'Unknown network prefix - potential fraud'
      }
    }

    // Check for suspicious patterns (e.g., too many zeros)
    const zeroCount = (cleaned.match(/0/g) || []).length
    if (zeroCount > 6) {
      return {
        isValid: true,
        isSuspicious: true,
        network,
        reason: 'Suspicious number pattern'
      }
    }

    return {
      isValid: true,
      isSuspicious: false,
      network
    }
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>'"]/g, (match) => { // Escape dangerous characters
        const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }
        return entities[match] || match
      })
  }

  /**
   * Detect potentially fraudulent content
   */
  detectFraudulentContent(content: string): {
    isFraudulent: boolean
    confidence: number
    reasons: string[]
  } {
    const reasons: string[] = []
    let suspiciousScore = 0

    // Check against known fraud patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        suspiciousScore += 20
        reasons.push('Contains known fraud pattern')
      }
    }

    // Check for excessive urgency words
    const urgencyWords = /urgent|immediate|asap|emergency|critical/gi
    const urgencyMatches = content.match(urgencyWords)
    if (urgencyMatches && urgencyMatches.length > 2) {
      suspiciousScore += 15
      reasons.push('Excessive urgency language')
    }

    // Check for money-related spam
    const moneySpam = /free\s+money|easy\s+cash|guaranteed\s+profit/gi
    if (moneySpam.test(content)) {
      suspiciousScore += 25
      reasons.push('Money-related spam detected')
    }

    // Check for fake contact information
    const fakeContacts = /contact\s+me\s+via|whatsapp\s+me/gi
    if (fakeContacts.test(content)) {
      suspiciousScore += 10
      reasons.push('Suspicious contact pattern')
    }

    return {
      isFraudulent: suspiciousScore >= 30,
      confidence: Math.min(suspiciousScore / 100, 1),
      reasons
    }
  }

  /**
   * Rate limiting based on Nigerian IP ranges and behavior
   */
  async checkRateLimit(
    identifier: string,
    action: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: Date
  }> {
    // This would integrate with Redis in production
    const key = `rate_limit:${identifier}:${action}`
    
    // For now, return a mock implementation
    // In production, this would use Redis with sliding window
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: new Date(Date.now() + windowMs)
    }
  }

  /**
   * Validate request origin for Nigerian marketplace
   */
  validateRequestOrigin(request: Request): {
    isValid: boolean
    risk: 'low' | 'medium' | 'high'
    reasons: string[]
  } {
    const reasons: string[] = []
    let riskScore = 0

    // Check User-Agent for suspicious patterns
    const userAgent = request.headers['user-agent'] || ''
    if (!userAgent || userAgent.length < 10) {
      riskScore += 30
      reasons.push('Missing or suspicious User-Agent')
    }

    // Check for Nigerian-specific headers
    const acceptLanguage = request.headers['accept-language'] || ''
    if (!acceptLanguage.includes('en')) {
      riskScore += 10
      reasons.push('Unusual language preference')
    }

    // Check X-Forwarded-For for proxy chains (common in fraud)
    const xForwardedFor = request.headers['x-forwarded-for']
    if (xForwardedFor && typeof xForwardedFor === 'string') {
      const proxies = xForwardedFor.split(',').length
      if (proxies > 3) {
        riskScore += 20
        reasons.push('Excessive proxy chain detected')
      }
    }

    // Check for automation tools
    const automationPatterns = /bot|crawler|spider|headless|phantom|selenium/i
    if (automationPatterns.test(userAgent)) {
      riskScore += 40
      reasons.push('Automation tool detected')
    }

    let risk: 'low' | 'medium' | 'high' = 'low'
    if (riskScore >= 50) risk = 'high'
    else if (riskScore >= 25) risk = 'medium'

    return {
      isValid: riskScore < 50,
      risk,
      reasons
    }
  }

  /**
   * Generate secure session token for Nigerian users
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Hash password with salt for Nigerian user accounts
   */
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex')
    const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  /**
   * Verify password hash
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split(':')
    const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === verifyHash
  }

  /**
   * Encrypt sensitive data (PII) for Nigerian users
   */
  encryptSensitiveData(data: string): {
    encrypted: string
    iv: string
  } {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY') || crypto.randomBytes(32).toString('hex'), 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return {
      encrypted,
      iv: iv.toString('hex')
    }
  }

  /**
   * Decrypt sensitive data
   */
  decryptSensitiveData(encryptedData: string, iv: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY') || crypto.randomBytes(32).toString('hex'), 'hex')
    const ivBuffer = Buffer.from(iv, 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Generate Nigerian marketplace-specific security headers
   */
  getSecurityHeaders(): Record<string, string> {
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
    }
  }

  /**
   * Log security events for Nigerian marketplace monitoring
   */
  logSecurityEvent(
    event: string,
    details: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details,
      marketplace: 'nigeria',
      timezone: 'Africa/Lagos'
    }

    switch (severity) {
      case 'critical':
        this.logger.error(`[SECURITY CRITICAL] ${event}`, logData)
        break
      case 'high':
        this.logger.error(`[SECURITY HIGH] ${event}`, logData)
        break
      case 'medium':
        this.logger.warn(`[SECURITY MEDIUM] ${event}`, logData)
        break
      default:
        this.logger.log(`[SECURITY] ${event}`, logData)
    }
  }

  /**
   * Validate Nigerian business registration number
   */
  validateBusinessRegistration(rcNumber: string): {
    isValid: boolean
    type: 'RC' | 'BN' | 'IT' | 'unknown'
    reasons: string[]
  } {
    const reasons: string[] = []
    
    // Nigerian business registration patterns
    const rcPattern = /^RC\d{6,7}$/i // Limited company
    const bnPattern = /^BN\d{6,7}$/i // Business name
    const itPattern = /^IT\d{6,7}$/i // Incorporated trustee

    if (rcPattern.test(rcNumber)) {
      return { isValid: true, type: 'RC', reasons: [] }
    } else if (bnPattern.test(rcNumber)) {
      return { isValid: true, type: 'BN', reasons: [] }
    } else if (itPattern.test(rcNumber)) {
      return { isValid: true, type: 'IT', reasons: [] }
    } else {
      reasons.push('Invalid Nigerian business registration format')
      return { isValid: false, type: 'unknown', reasons }
    }
  }
}