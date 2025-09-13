"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NigerianComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NigerianComplianceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let NigerianComplianceService = NigerianComplianceService_1 = class NigerianComplianceService {
    configService;
    logger = new common_1.Logger(NigerianComplianceService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    validateNDPRCompliance(userData) {
        const violations = [];
        const recommendations = [];
        if (!userData.consentGiven) {
            violations.push('No explicit consent recorded for data processing');
            recommendations.push('Obtain explicit consent before processing personal data');
        }
        if (!userData.lawfulBasis) {
            violations.push('No lawful basis specified for data processing');
            recommendations.push('Document lawful basis under NDPR Article 6');
        }
        const sensitiveFields = ['bvn', 'nin', 'bankAccount', 'creditCard'];
        const unnecessaryData = sensitiveFields.filter(field => userData[field] && !userData.requiredFields?.includes(field));
        if (unnecessaryData.length > 0) {
            violations.push(`Collecting unnecessary sensitive data: ${unnecessaryData.join(', ')}`);
            recommendations.push('Only collect data necessary for the specific purpose');
        }
        if (!userData.retentionPeriod) {
            violations.push('No data retention period specified');
            recommendations.push('Define and document data retention periods');
        }
        return {
            isCompliant: violations.length === 0,
            violations,
            recommendations
        };
    }
    validateCBNCompliance(transactionData) {
        const violations = [];
        const reportingRequirements = [];
        let requiresReporting = false;
        const amount = transactionData.amount || 0;
        const dailyLimit = 5000000;
        const monthlyLimit = 20000000;
        if (amount > dailyLimit) {
            requiresReporting = true;
            reportingRequirements.push('High-value transaction requires CBN reporting');
        }
        if (this.isSuspiciousTransaction(transactionData)) {
            requiresReporting = true;
            reportingRequirements.push('Suspicious transaction pattern detected - file STR');
        }
        if (amount > 1000000 && !transactionData.bvnVerified) {
            violations.push('BVN verification required for transactions above ₦1M');
        }
        if (!transactionData.pepScreened) {
            violations.push('PEP screening required for all users');
            reportingRequirements.push('Conduct PEP screening before transaction approval');
        }
        return {
            isCompliant: violations.length === 0,
            requiresReporting,
            violations,
            reportingRequirements
        };
    }
    validateCACCompliance(businessData) {
        const violations = [];
        const requirements = [];
        const rcNumber = businessData.rcNumber;
        if (!rcNumber) {
            violations.push('CAC registration number is required for business accounts');
            requirements.push('Provide valid CAC registration number');
        }
        else {
            const rcPattern = /^(RC|BN|IT)\d{6,7}$/i;
            if (!rcPattern.test(rcNumber)) {
                violations.push('Invalid CAC registration number format');
                requirements.push('Provide valid RC/BN/IT number format');
            }
        }
        if (!businessData.registrationStatus) {
            violations.push('Business registration status not verified');
            requirements.push('Verify business registration with CAC');
        }
        if (!businessData.businessAddress || !this.isNigerianAddress(businessData.businessAddress)) {
            violations.push('Valid Nigerian business address required');
            requirements.push('Provide Nigerian business address as per CAC records');
        }
        return {
            isValid: violations.length === 0,
            registrationType: this.getRegistrationType(rcNumber),
            violations,
            requirements
        };
    }
    validateNCCCompliance(phoneData) {
        const violations = [];
        const requirements = [];
        if (!phoneData.simRegistered) {
            violations.push('SIM card must be registered with NCC');
            requirements.push('Verify SIM registration status');
        }
        if (!phoneData.ninLinked) {
            violations.push('Phone number must be linked to NIN');
            requirements.push('Link phone number to National Identity Number');
        }
        const network = phoneData.network;
        const licensedNetworks = ['MTN', 'Glo', 'Airtel', '9mobile'];
        if (!licensedNetworks.includes(network)) {
            violations.push('Unknown or unlicensed network operator');
            requirements.push('Use phone number from licensed network operator');
        }
        return {
            isCompliant: violations.length === 0,
            violations,
            requirements
        };
    }
    validateAMLCompliance(userProfile, transactionHistory) {
        const violations = [];
        const recommendations = [];
        let riskScore = 0;
        if (!userProfile.kycCompleted) {
            riskScore += 30;
            violations.push('KYC not completed');
            recommendations.push('Complete customer due diligence process');
        }
        if (this.isHighRiskJurisdiction(userProfile.location)) {
            riskScore += 25;
            recommendations.push('Enhanced due diligence required for high-risk location');
        }
        const transactionRisk = this.analyzeTransactionPatterns(transactionHistory);
        riskScore += transactionRisk.score;
        if (transactionRisk.suspicious) {
            violations.push('Suspicious transaction patterns detected');
            recommendations.push('File Suspicious Transaction Report (STR)');
        }
        if (!userProfile.sanctionsScreened) {
            riskScore += 20;
            violations.push('Sanctions screening not completed');
            recommendations.push('Screen against OFAC and UN sanctions lists');
        }
        let riskLevel = 'low';
        if (riskScore >= 70)
            riskLevel = 'prohibited';
        else if (riskScore >= 50)
            riskLevel = 'high';
        else if (riskScore >= 25)
            riskLevel = 'medium';
        return {
            riskLevel,
            requiresDueDiligence: riskScore >= 25,
            violations,
            recommendations
        };
    }
    validateTaxCompliance(incomeData) {
        const taxObligations = [];
        const exemptions = [];
        const annualIncome = incomeData.annualIncome || 0;
        const personalExemptionLimit = 300000;
        if (annualIncome > personalExemptionLimit) {
            taxObligations.push('Personal Income Tax (PIT) registration required');
            taxObligations.push('Annual tax returns filing required');
        }
        else {
            exemptions.push('Below personal income tax threshold');
        }
        if (incomeData.businessType && annualIncome > 25000000) {
            taxObligations.push('VAT registration and remittance required');
        }
        if (incomeData.hasEmployees) {
            taxObligations.push('PAYE withholding tax obligations');
        }
        return {
            requiresTaxReporting: taxObligations.length > 0,
            taxObligations,
            exemptions
        };
    }
    generateComplianceReport(userId, reportType) {
        const reportId = `RPT_${reportType}_${Date.now()}`;
        return {
            reportId,
            generatedAt: new Date(),
            complianceStatus: 'compliant',
            findings: [],
            recommendations: []
        };
    }
    logComplianceEvent(event, userId, details, regulation) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            userId,
            regulation,
            details,
            timezone: 'Africa/Lagos',
            jurisdiction: 'Nigeria'
        };
        this.logger.log(`[COMPLIANCE-${regulation}] ${event}`, logEntry);
    }
    isSuspiciousTransaction(transaction) {
        const amount = transaction.amount || 0;
        const frequency = transaction.frequency || 0;
        const isRoundNumber = amount % 100000 === 0 && amount > 500000;
        const isStructuring = amount < 500000 && frequency > 10;
        return isRoundNumber || isStructuring;
    }
    isNigerianAddress(address) {
        const nigerianStates = [
            'Lagos', 'Abuja', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Delta', 'Imo',
            'Anambra', 'Akwa Ibom', 'Edo', 'Kwara', 'Enugu', 'Kebbi', 'Sokoto'
        ];
        return nigerianStates.some(state => address.toLowerCase().includes(state.toLowerCase()));
    }
    getRegistrationType(rcNumber) {
        if (!rcNumber)
            return 'unknown';
        if (rcNumber.toUpperCase().startsWith('RC'))
            return 'Limited Company';
        if (rcNumber.toUpperCase().startsWith('BN'))
            return 'Business Name';
        if (rcNumber.toUpperCase().startsWith('IT'))
            return 'Incorporated Trustee';
        return 'unknown';
    }
    isHighRiskJurisdiction(location) {
        const highRiskAreas = [
            'Borno', 'Yobe', 'Adamawa',
            'Zamfara', 'Katsina', 'Kaduna'
        ];
        return highRiskAreas.some(area => location.toLowerCase().includes(area.toLowerCase()));
    }
    analyzeTransactionPatterns(transactions) {
        const patterns = [];
        let score = 0;
        if (transactions.length === 0)
            return { score: 0, suspicious: false, patterns };
        const rapidTransactions = transactions.filter((_, index, arr) => {
            if (index === 0)
                return false;
            const timeDiff = new Date(arr[index].timestamp).getTime() - new Date(arr[index - 1].timestamp).getTime();
            return timeDiff < 60000;
        });
        if (rapidTransactions.length > 3) {
            score += 20;
            patterns.push('Rapid succession transactions detected');
        }
        const amounts = transactions.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const unusualAmounts = amounts.filter(amount => amount > avgAmount * 10);
        if (unusualAmounts.length > 0) {
            score += 15;
            patterns.push('Unusual transaction amounts detected');
        }
        return {
            score,
            suspicious: score >= 25,
            patterns
        };
    }
};
exports.NigerianComplianceService = NigerianComplianceService;
exports.NigerianComplianceService = NigerianComplianceService = NigerianComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NigerianComplianceService);
//# sourceMappingURL=nigerian-compliance.service.js.map