import { ConfigService } from '@nestjs/config';
export declare class NigerianComplianceService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    validateNDPRCompliance(userData: any): {
        isCompliant: boolean;
        violations: string[];
        recommendations: string[];
    };
    validateCBNCompliance(transactionData: any): {
        isCompliant: boolean;
        requiresReporting: boolean;
        violations: string[];
        reportingRequirements: string[];
    };
    validateCACCompliance(businessData: any): {
        isValid: boolean;
        registrationType: string;
        violations: string[];
        requirements: string[];
    };
    validateNCCCompliance(phoneData: any): {
        isCompliant: boolean;
        violations: string[];
        requirements: string[];
    };
    validateAMLCompliance(userProfile: any, transactionHistory: any[]): {
        riskLevel: 'low' | 'medium' | 'high' | 'prohibited';
        requiresDueDiligence: boolean;
        violations: string[];
        recommendations: string[];
    };
    validateTaxCompliance(incomeData: any): {
        requiresTaxReporting: boolean;
        taxObligations: string[];
        exemptions: string[];
    };
    generateComplianceReport(userId: string, reportType: 'NDPR' | 'CBN' | 'CAC' | 'AML'): {
        reportId: string;
        generatedAt: Date;
        complianceStatus: 'compliant' | 'non-compliant' | 'pending';
        findings: string[];
        recommendations: string[];
    };
    logComplianceEvent(event: string, userId: string, details: any, regulation: 'NDPR' | 'CBN' | 'CAC' | 'NCC' | 'AML' | 'FIRS'): void;
    private isSuspiciousTransaction;
    private isNigerianAddress;
    private getRegistrationType;
    private isHighRiskJurisdiction;
    private analyzeTransactionPatterns;
}
