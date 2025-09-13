import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class NigerianComplianceService {
  private readonly logger = new Logger(NigerianComplianceService.name)

  constructor(private configService: ConfigService) {}

  /**
   * Nigerian Data Protection Regulation (NDPR) compliance
   */
  validateNDPRCompliance(userData: any): {
    isCompliant: boolean
    violations: string[]
    recommendations: string[]
  } {
    const violations: string[] = []
    const recommendations: string[] = []

    // Check for explicit consent
    if (!userData.consentGiven) {
      violations.push('No explicit consent recorded for data processing')
      recommendations.push('Obtain explicit consent before processing personal data')
    }

    // Check for lawful basis
    if (!userData.lawfulBasis) {
      violations.push('No lawful basis specified for data processing')
      recommendations.push('Document lawful basis under NDPR Article 6')
    }

    // Check for data minimization
    const sensitiveFields = ['bvn', 'nin', 'bankAccount', 'creditCard']
    const unnecessaryData = sensitiveFields.filter(field => 
      userData[field] && !userData.requiredFields?.includes(field)
    )
    
    if (unnecessaryData.length > 0) {
      violations.push(`Collecting unnecessary sensitive data: ${unnecessaryData.join(', ')}`)
      recommendations.push('Only collect data necessary for the specific purpose')
    }

    // Check retention period
    if (!userData.retentionPeriod) {
      violations.push('No data retention period specified')
      recommendations.push('Define and document data retention periods')
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    }
  }

  /**
   * Central Bank of Nigeria (CBN) financial regulations compliance
   */
  validateCBNCompliance(transactionData: any): {
    isCompliant: boolean
    requiresReporting: boolean
    violations: string[]
    reportingRequirements: string[]
  } {
    const violations: string[] = []
    const reportingRequirements: string[] = []
    let requiresReporting = false

    // Check transaction limits (CBN guidelines)
    const amount = transactionData.amount || 0
    const dailyLimit = 5000000 // ₦5M daily limit for high-value transactions
    const monthlyLimit = 20000000 // ₦20M monthly limit

    if (amount > dailyLimit) {
      requiresReporting = true
      reportingRequirements.push('High-value transaction requires CBN reporting')
    }

    // Check for suspicious transaction patterns
    if (this.isSuspiciousTransaction(transactionData)) {
      requiresReporting = true
      reportingRequirements.push('Suspicious transaction pattern detected - file STR')
    }

    // Verify BVN for high-value transactions
    if (amount > 1000000 && !transactionData.bvnVerified) {
      violations.push('BVN verification required for transactions above ₦1M')
    }

    // Check for PEP (Politically Exposed Person) screening
    if (!transactionData.pepScreened) {
      violations.push('PEP screening required for all users')
      reportingRequirements.push('Conduct PEP screening before transaction approval')
    }

    return {
      isCompliant: violations.length === 0,
      requiresReporting,
      violations,
      reportingRequirements
    }
  }

  /**
   * Corporate Affairs Commission (CAC) business compliance
   */
  validateCACCompliance(businessData: any): {
    isValid: boolean
    registrationType: string
    violations: string[]
    requirements: string[]
  } {
    const violations: string[] = []
    const requirements: string[] = []

    // Validate RC number format
    const rcNumber = businessData.rcNumber
    if (!rcNumber) {
      violations.push('CAC registration number is required for business accounts')
      requirements.push('Provide valid CAC registration number')
    } else {
      const rcPattern = /^(RC|BN|IT)\d{6,7}$/i
      if (!rcPattern.test(rcNumber)) {
        violations.push('Invalid CAC registration number format')
        requirements.push('Provide valid RC/BN/IT number format')
      }
    }

    // Check business registration status
    if (!businessData.registrationStatus) {
      violations.push('Business registration status not verified')
      requirements.push('Verify business registration with CAC')
    }

    // Validate business address in Nigeria
    if (!businessData.businessAddress || !this.isNigerianAddress(businessData.businessAddress)) {
      violations.push('Valid Nigerian business address required')
      requirements.push('Provide Nigerian business address as per CAC records')
    }

    return {
      isValid: violations.length === 0,
      registrationType: this.getRegistrationType(rcNumber),
      violations,
      requirements
    }
  }

  /**
   * Nigerian Communications Commission (NCC) telecommunications compliance
   */
  validateNCCCompliance(phoneData: any): {
    isCompliant: boolean
    violations: string[]
    requirements: string[]
  } {
    const violations: string[] = []
    const requirements: string[] = []

    // Validate SIM registration
    if (!phoneData.simRegistered) {
      violations.push('SIM card must be registered with NCC')
      requirements.push('Verify SIM registration status')
    }

    // Check NIN linkage (mandatory since 2020)
    if (!phoneData.ninLinked) {
      violations.push('Phone number must be linked to NIN')
      requirements.push('Link phone number to National Identity Number')
    }

    // Validate network operator license
    const network = phoneData.network
    const licensedNetworks = ['MTN', 'Glo', 'Airtel', '9mobile']
    if (!licensedNetworks.includes(network)) {
      violations.push('Unknown or unlicensed network operator')
      requirements.push('Use phone number from licensed network operator')
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      requirements
    }
  }

  /**
   * Financial Intelligence Unit (NFIU) anti-money laundering compliance
   */
  validateAMLCompliance(userProfile: any, transactionHistory: any[]): {
    riskLevel: 'low' | 'medium' | 'high' | 'prohibited'
    requiresDueDiligence: boolean
    violations: string[]
    recommendations: string[]
  } {
    const violations: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // Check customer due diligence
    if (!userProfile.kycCompleted) {
      riskScore += 30
      violations.push('KYC not completed')
      recommendations.push('Complete customer due diligence process')
    }

    // Check for high-risk jurisdictions
    if (this.isHighRiskJurisdiction(userProfile.location)) {
      riskScore += 25
      recommendations.push('Enhanced due diligence required for high-risk location')
    }

    // Analyze transaction patterns
    const transactionRisk = this.analyzeTransactionPatterns(transactionHistory)
    riskScore += transactionRisk.score

    if (transactionRisk.suspicious) {
      violations.push('Suspicious transaction patterns detected')
      recommendations.push('File Suspicious Transaction Report (STR)')
    }

    // Check for sanctions screening
    if (!userProfile.sanctionsScreened) {
      riskScore += 20
      violations.push('Sanctions screening not completed')
      recommendations.push('Screen against OFAC and UN sanctions lists')
    }

    let riskLevel: 'low' | 'medium' | 'high' | 'prohibited' = 'low'
    if (riskScore >= 70) riskLevel = 'prohibited'
    else if (riskScore >= 50) riskLevel = 'high'
    else if (riskScore >= 25) riskLevel = 'medium'

    return {
      riskLevel,
      requiresDueDiligence: riskScore >= 25,
      violations,
      recommendations
    }
  }

  /**
   * Nigerian tax compliance (FIRS)
   */
  validateTaxCompliance(incomeData: any): {
    requiresTaxReporting: boolean
    taxObligations: string[]
    exemptions: string[]
  } {
    const taxObligations: string[] = []
    const exemptions: string[] = []
    const annualIncome = incomeData.annualIncome || 0

    // Check personal income tax thresholds
    const personalExemptionLimit = 300000 // ₦300,000 annual exemption
    
    if (annualIncome > personalExemptionLimit) {
      taxObligations.push('Personal Income Tax (PIT) registration required')
      taxObligations.push('Annual tax returns filing required')
    } else {
      exemptions.push('Below personal income tax threshold')
    }

    // Check VAT obligations for businesses
    if (incomeData.businessType && annualIncome > 25000000) { // ₦25M VAT threshold
      taxObligations.push('VAT registration and remittance required')
    }

    // Check withholding tax obligations
    if (incomeData.hasEmployees) {
      taxObligations.push('PAYE withholding tax obligations')
    }

    return {
      requiresTaxReporting: taxObligations.length > 0,
      taxObligations,
      exemptions
    }
  }

  /**
   * Generate compliance report for Nigerian authorities
   */
  generateComplianceReport(userId: string, reportType: 'NDPR' | 'CBN' | 'CAC' | 'AML'): {
    reportId: string
    generatedAt: Date
    complianceStatus: 'compliant' | 'non-compliant' | 'pending'
    findings: string[]
    recommendations: string[]
  } {
    const reportId = `RPT_${reportType}_${Date.now()}`
    
    // This would integrate with actual compliance checking
    return {
      reportId,
      generatedAt: new Date(),
      complianceStatus: 'compliant',
      findings: [],
      recommendations: []
    }
  }

  /**
   * Log compliance events for audit trail
   */
  logComplianceEvent(
    event: string,
    userId: string,
    details: any,
    regulation: 'NDPR' | 'CBN' | 'CAC' | 'NCC' | 'AML' | 'FIRS'
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      regulation,
      details,
      timezone: 'Africa/Lagos',
      jurisdiction: 'Nigeria'
    }

    this.logger.log(`[COMPLIANCE-${regulation}] ${event}`, logEntry)
  }

  private isSuspiciousTransaction(transaction: any): boolean {
    // Implement suspicious transaction detection logic
    const amount = transaction.amount || 0
    const frequency = transaction.frequency || 0
    
    // Round number amounts might be suspicious
    const isRoundNumber = amount % 100000 === 0 && amount > 500000
    
    // High frequency small transactions
    const isStructuring = amount < 500000 && frequency > 10
    
    return isRoundNumber || isStructuring
  }

  private isNigerianAddress(address: string): boolean {
    const nigerianStates = [
      'Lagos', 'Abuja', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Delta', 'Imo',
      'Anambra', 'Akwa Ibom', 'Edo', 'Kwara', 'Enugu', 'Kebbi', 'Sokoto'
    ]
    
    return nigerianStates.some(state => 
      address.toLowerCase().includes(state.toLowerCase())
    )
  }

  private getRegistrationType(rcNumber: string): string {
    if (!rcNumber) return 'unknown'
    
    if (rcNumber.toUpperCase().startsWith('RC')) return 'Limited Company'
    if (rcNumber.toUpperCase().startsWith('BN')) return 'Business Name'
    if (rcNumber.toUpperCase().startsWith('IT')) return 'Incorporated Trustee'
    
    return 'unknown'
  }

  private isHighRiskJurisdiction(location: string): boolean {
    // List of high-risk areas in Nigeria (security concerns)
    const highRiskAreas = [
      'Borno', 'Yobe', 'Adamawa', // Northeast security issues
      'Zamfara', 'Katsina', 'Kaduna' // Northwest security issues
    ]
    
    return highRiskAreas.some(area => 
      location.toLowerCase().includes(area.toLowerCase())
    )
  }

  private analyzeTransactionPatterns(transactions: any[]): {
    score: number
    suspicious: boolean
    patterns: string[]
  } {
    const patterns: string[] = []
    let score = 0

    if (transactions.length === 0) return { score: 0, suspicious: false, patterns }

    // Check for rapid succession of transactions
    const rapidTransactions = transactions.filter((_, index, arr) => {
      if (index === 0) return false
      const timeDiff = new Date(arr[index].timestamp).getTime() - new Date(arr[index - 1].timestamp).getTime()
      return timeDiff < 60000 // Less than 1 minute apart
    })

    if (rapidTransactions.length > 3) {
      score += 20
      patterns.push('Rapid succession transactions detected')
    }

    // Check for unusual amounts
    const amounts = transactions.map(t => t.amount)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const unusualAmounts = amounts.filter(amount => amount > avgAmount * 10)

    if (unusualAmounts.length > 0) {
      score += 15
      patterns.push('Unusual transaction amounts detected')
    }

    return {
      score,
      suspicious: score >= 25,
      patterns
    }
  }
}