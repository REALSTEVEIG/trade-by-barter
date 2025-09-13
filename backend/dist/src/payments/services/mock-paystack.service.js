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
var MockPaystackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaystackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
let MockPaystackService = MockPaystackService_1 = class MockPaystackService {
    configService;
    logger = new common_1.Logger(MockPaystackService_1.name);
    baseUrl;
    secretKey;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = 'https://api.paystack.co';
        this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY') || 'sk_test_mock';
    }
    async initializePayment(email, amountInKobo, reference, metadata) {
        this.logger.log(`Initializing mock payment for ${email}, amount: ${amountInKobo} kobo`);
        await this.delay(500);
        const isSuccess = Math.random() > 0.1;
        if (!isSuccess) {
            throw new Error('Mock payment initialization failed');
        }
        const accessCode = `mock_access_${Date.now()}`;
        const authUrl = `https://checkout.paystack.com/${accessCode}`;
        return {
            status: true,
            message: 'Authorization URL created',
            data: {
                authorization_url: authUrl,
                access_code: accessCode,
                reference,
            },
        };
    }
    async verifyPayment(reference) {
        this.logger.log(`Verifying mock payment with reference: ${reference}`);
        await this.delay(300);
        const isSuccess = Math.random() > 0.05;
        const status = isSuccess ? 'success' : 'failed';
        const now = new Date().toISOString();
        return {
            id: Math.floor(Math.random() * 1000000),
            domain: 'test',
            status,
            reference,
            amount: 500000,
            message: isSuccess ? 'Approved' : 'Declined by Financial Institution',
            gateway_response: isSuccess ? 'Successful' : 'Declined by Financial Institution',
            paid_at: isSuccess ? now : null,
            created_at: now,
            channel: 'card',
            currency: 'NGN',
            ip_address: '127.0.0.1',
            metadata: {},
            fees: isSuccess ? Math.floor(500000 * 0.015) : 0,
            authorization: {
                authorization_code: `AUTH_${(0, uuid_1.v4)().substring(0, 8)}`,
                bin: '408408',
                last4: '4081',
                exp_month: '12',
                exp_year: '2030',
                channel: 'card',
                card_type: 'visa',
                bank: 'TEST BANK',
                country_code: 'NG',
                brand: 'visa',
                reusable: true,
                signature: `SIG_${(0, uuid_1.v4)().substring(0, 8)}`,
            },
            customer: {
                id: Math.floor(Math.random() * 100000),
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                phone: '+2348012345678',
                metadata: {},
            },
        };
    }
    async createTransferRecipient(accountNumber, bankCode, name) {
        this.logger.log(`Creating mock transfer recipient: ${accountNumber}`);
        await this.delay(300);
        return {
            status: true,
            message: 'Transfer recipient created successfully',
            data: {
                active: true,
                createdAt: new Date().toISOString(),
                currency: 'NGN',
                domain: 'test',
                id: Math.floor(Math.random() * 100000),
                integration: 123456,
                name,
                recipient_code: `RCP_${(0, uuid_1.v4)().substring(0, 8)}`,
                type: 'nuban',
                updatedAt: new Date().toISOString(),
                is_deleted: false,
                details: {
                    authorization_code: null,
                    account_number: accountNumber,
                    account_name: name,
                    bank_code: bankCode,
                    bank_name: this.getBankName(bankCode),
                },
            },
        };
    }
    async initiateTransfer(recipientCode, amountInKobo, reason) {
        this.logger.log(`Initiating mock transfer: ${amountInKobo} kobo to ${recipientCode}`);
        await this.delay(500);
        const isSuccess = Math.random() > 0.05;
        return {
            status: isSuccess,
            message: isSuccess ? 'Transfer has been queued' : 'Transfer failed',
            data: isSuccess ? {
                integration: 123456,
                domain: 'test',
                amount: amountInKobo,
                currency: 'NGN',
                source: 'balance',
                reason,
                recipient: recipientCode,
                status: 'pending',
                transfer_code: `TRF_${(0, uuid_1.v4)().substring(0, 8)}`,
                id: Math.floor(Math.random() * 1000000),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } : null,
        };
    }
    verifyWebhookSignature(payload, signature) {
        this.logger.log('Verifying mock webhook signature');
        return !!signature;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getBankName(bankCode) {
        const banks = {
            '044': 'Access Bank',
            '063': 'Access Bank (Diamond)',
            '050': 'Ecobank Nigeria',
            '070': 'Fidelity Bank',
            '011': 'First Bank of Nigeria',
            '214': 'First City Monument Bank',
            '058': 'Guaranty Trust Bank',
            '030': 'Heritage Bank',
            '082': 'Keystone Bank',
            '014': 'Mainstreet Bank',
            '076': 'Polaris Bank',
            '101': 'Providus Bank',
            '221': 'Stanbic IBTC Bank',
            '068': 'Standard Chartered Bank',
            '232': 'Sterling Bank',
            '032': 'Union Bank of Nigeria',
            '033': 'United Bank For Africa',
            '215': 'Unity Bank',
            '035': 'Wema Bank',
            '057': 'Zenith Bank',
            '090': 'Bowen Microfinance Bank',
            '304': 'Stanbic Mobile Money',
            '100': 'SunTrust Bank',
            '301': 'JAIZ Bank',
            '302': 'TAJ Bank',
            '120': 'Greenwich Merchant Bank',
            '811': 'First Bank Morggage Bank',
            '601': 'FSDH Merchant Bank',
            '060': 'Citibank Nigeria',
            '023': 'CitiBank',
            '040': 'Equitorial Trust Bank',
            '084': 'Enterprise Bank',
            '090254': 'Addosser Microfinance Bank',
            '090133': 'AL-BARAKAH MICROFINANCE BANK',
            '090270': 'AB MICROFINANCE BANK',
            '090371': 'AGOSASA MICROFINANCE BANK',
            '090264': 'ASTRAPOLARIS MICROFINANCE BANK',
            '090287': 'BAINES CREDIT MICROFINANCE BANK',
            '090326': 'BALOGUN GAMBARI MICROFINANCE BANK',
            '090127': 'BC KASH MICROFINANCE BANK',
            '090336': 'BIPC MICROFINANCE BANK',
            '090148': 'BOWEN MICROFINANCE BANK',
            '090393': 'BRETHREN MICROFINANCE BANK',
            '090176': 'BOSAK MICROFINANCE BANK',
            '090299': 'COASTLINE MICROFINANCE BANK',
            '090365': 'CORESTEP MICROFINANCE BANK',
            '090167': 'DAYLIGHT MICROFINANCE BANK',
            '090391': 'DAVODANI MICROFINANCE BANK',
            '090394': 'EAGLE FLIGHT MICROFINANCE BANK',
            '090114': 'EMPIRE MICROFINANCE BANK',
            '090097': 'EKONDO MICROFINANCE BANK',
            '090389': 'EK-RELIABLE MICROFINANCE BANK',
            '090166': 'ESO-E MICROFINANCE BANK',
            '090179': 'FAST MICROFINANCE BANK',
            '090126': 'FIDFUND MICROFINANCE BANK',
            '090153': 'FFS MICROFINANCE BANK',
            '090400': 'FINEX MICROFINANCE BANK',
            '090111': 'GATEWAY MICROFINANCE BANK',
            '090178': 'GREENBANK MICROFINANCE BANK',
            '090147': 'HACKMAN MICROFINANCE BANK',
            '090363': 'HEADWAY MICROFINANCE BANK',
            '090175': 'HIGHSTREET MICROFINANCE BANK',
            '090251': 'IKIRE MICROFINANCE BANK',
            '090149': 'IRL MICROFINANCE BANK',
            '090259': 'ITEX INTEGRATED SERVICES',
            '090318': 'FEDERAL UNIVERSITY DUTSE MICROFINANCE BANK',
            '090372': 'IKOYI OSUN MICROFINANCE BANK',
            '090324': 'IKENNE MICROFINANCE BANK',
            '090279': 'ISALEOYO MICROFINANCE BANK',
            '090267': 'KUDA MICROFINANCE BANK',
            '090170': 'KOGI UNIVERSITY MICROFINANCE BANK',
            '090280': 'KWASU MICROFINANCE BANK',
            '090177': 'LAPO MICROFINANCE BANK',
            '090271': 'LAVENDER MICROFINANCE BANK',
            '090196': 'MALACHY MICROFINANCE BANK',
            '090190': 'MUTUAL TRUST MICROFINANCE BANK',
            '090328': 'NDIORAH MICROFINANCE BANK',
            '090205': 'NEW DAWN MICROFINANCE BANK',
            '090263': 'NIGERIAN NAVY MICROFINANCE BANK',
            '090128': 'NSLMFB',
            '090194': 'NIRSAL NATIONAL MICROFINANCE BANK',
            '090289': 'OKPOGA MICROFINANCE BANK',
            '090161': 'OKUKU MICROFINANCE BANK',
            '090119': 'OHAFIA MICROFINANCE BANK',
            '090274': 'PENNYWISE MICROFINANCE BANK',
            '090317': 'PATRICKGOLD MICROFINANCE BANK',
            '090325': 'REGENT MICROFINANCE BANK',
            '090198': 'RENMONEY MICROFINANCE BANK',
            '090164': 'REFUGE MORTGAGE BANK',
            '090135': 'RUBIES MICROFINANCE BANK',
            '090286': 'SAFE HAVEN MICROFINANCE BANK',
            '090140': 'SAGAMU MICROFINANCE BANK',
            '090162': 'STANFORD MICROFINANCE BANK',
            '090305': 'SPARKLE MICROFINANCE BANK',
            '090168': 'TRIDENT MICROFINANCE BANK',
            '090146': 'TRUST MICROFINANCE BANK',
            '090123': 'TRUSTFUND MICROFINANCE BANK',
            '090276': 'UNIVERSITY OF NIGERIA, NSUKKA MICROFINANCE BANK',
            '090332': 'UNAAB MICROFINANCE BANK',
            '090180': 'AMML MICROFINANCE BANK',
            '090373': 'ILISAN MICROFINANCE BANK',
        };
        return banks[bankCode] || 'Unknown Bank';
    }
    getAllNigerianBanks() {
        return [
            { code: '044', name: 'Access Bank', ussd: '*901#' },
            { code: '063', name: 'Access Bank (Diamond)', ussd: '*426#' },
            { code: '050', name: 'Ecobank Nigeria', ussd: '*326#' },
            { code: '070', name: 'Fidelity Bank', ussd: '*770#' },
            { code: '011', name: 'First Bank of Nigeria', ussd: '*894#' },
            { code: '214', name: 'First City Monument Bank', ussd: '*329#' },
            { code: '058', name: 'Guaranty Trust Bank', ussd: '*737#' },
            { code: '030', name: 'Heritage Bank', ussd: '*745#' },
            { code: '082', name: 'Keystone Bank', ussd: '*7111#' },
            { code: '076', name: 'Polaris Bank', ussd: '*833#' },
            { code: '101', name: 'Providus Bank', ussd: '*737*6#' },
            { code: '221', name: 'Stanbic IBTC Bank', ussd: '*909#' },
            { code: '068', name: 'Standard Chartered Bank', ussd: '*977#' },
            { code: '232', name: 'Sterling Bank', ussd: '*822#' },
            { code: '032', name: 'Union Bank of Nigeria', ussd: '*826#' },
            { code: '033', name: 'United Bank For Africa', ussd: '*919#' },
            { code: '215', name: 'Unity Bank', ussd: '*7799#' },
            { code: '035', name: 'Wema Bank', ussd: '*945#' },
            { code: '057', name: 'Zenith Bank', ussd: '*966#' },
            { code: '301', name: 'JAIZ Bank', ussd: '*389#' },
            { code: '302', name: 'TAJ Bank', ussd: '*712#' },
            { code: '090267', name: 'Kuda Microfinance Bank', ussd: '*711#' },
            { code: '090177', name: 'LAPO Microfinance Bank', ussd: '*5737#' },
            { code: '090194', name: 'NIRSAL National Microfinance Bank', ussd: '*5772#' },
            { code: '090198', name: 'RENMONEY Microfinance Bank', ussd: '*7909#' },
        ];
    }
    getPaymentMethods() {
        return [
            {
                type: 'card',
                name: 'Debit/Credit Card',
                description: 'Pay with your Nigerian bank card (Verve, Visa, Mastercard)',
                processingTime: 'Instant',
                fee: '1.5% + ₦10'
            },
            {
                type: 'bank_transfer',
                name: 'Bank Transfer',
                description: 'Direct bank transfer using your bank app or USSD',
                processingTime: '5-10 minutes',
                fee: '₦50 flat fee'
            },
            {
                type: 'ussd',
                name: 'USSD Banking',
                description: 'Pay using your bank USSD code from any mobile phone',
                processingTime: 'Instant',
                fee: '₦50 flat fee'
            },
            {
                type: 'mobile_money',
                name: 'Mobile Money',
                description: 'Pay with mobile money services (GTB Mobile Money, Access Mobile, etc.)',
                processingTime: 'Instant',
                fee: '1.5% capped at ₦2000'
            },
            {
                type: 'qr_code',
                name: 'QR Code Payment',
                description: 'Scan QR code with your bank mobile app to pay',
                processingTime: 'Instant',
                fee: '₦25 flat fee'
            }
        ];
    }
    generateNigerianPaymentScenario(paymentMethod, amount) {
        const scenarios = {
            card: {
                channel: 'card',
                gateway_response: 'Approved by Financial Institution',
                authorization: {
                    authorization_code: `AUTH_${Date.now()}`,
                    bin: this.getRandomNigerianBin(),
                    last4: Math.floor(1000 + Math.random() * 9000).toString(),
                    exp_month: String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'),
                    exp_year: String(2025 + Math.floor(Math.random() * 8)),
                    channel: 'card',
                    card_type: Math.random() > 0.6 ? 'verve' : Math.random() > 0.5 ? 'visa' : 'mastercard',
                    bank: this.getRandomNigerianBank(),
                    country_code: 'NG',
                    brand: Math.random() > 0.6 ? 'verve' : Math.random() > 0.5 ? 'visa' : 'mastercard',
                    reusable: true,
                    signature: `SIG_${Date.now()}`
                },
                fees: Math.max(1000, Math.floor(amount * 0.015))
            },
            bank_transfer: {
                channel: 'bank',
                gateway_response: 'Transaction successful',
                fees: 5000
            },
            ussd: {
                channel: 'ussd',
                gateway_response: 'Transaction completed via USSD',
                fees: 5000
            },
            mobile_money: {
                channel: 'mobile_money',
                gateway_response: 'Mobile money payment successful',
                fees: Math.min(200000, Math.floor(amount * 0.015))
            },
            qr_code: {
                channel: 'qr',
                gateway_response: 'QR code payment completed',
                fees: 2500
            }
        };
        return scenarios[paymentMethod] || scenarios.card;
    }
    getRandomNigerianBin() {
        const bins = [
            '506099', '506100', '650002', '627780',
            '408408', '411111', '424242', '455187',
            '515393', '526738', '535130', '557859',
        ];
        return bins[Math.floor(Math.random() * bins.length)];
    }
    getRandomNigerianBank() {
        const banks = [
            'Access Bank', 'GTBank', 'First Bank', 'Zenith Bank',
            'UBA', 'Fidelity Bank', 'Sterling Bank', 'FCMB',
            'Union Bank', 'Wema Bank', 'Ecobank', 'Polaris Bank'
        ];
        return banks[Math.floor(Math.random() * banks.length)];
    }
    async initializeMobileMoneyPayment(phoneNumber, amountInKobo, provider = 'gtb_mobile') {
        this.logger.log(`Initializing mobile money payment: ${provider} for ${phoneNumber}`);
        await this.delay(800);
        const isSuccess = Math.random() > 0.08;
        if (!isSuccess) {
            throw new Error(`Mobile money payment failed: Insufficient balance or invalid ${provider} account`);
        }
        return {
            status: true,
            message: 'Mobile money payment initiated',
            data: {
                reference: `MM_${Date.now()}`,
                provider,
                phone_number: phoneNumber,
                amount: amountInKobo,
                currency: 'NGN',
                status: 'pending',
                instructions: `You will receive a USSD prompt on ${phoneNumber} to authorize this payment.`
            }
        };
    }
    async initiateUSSDPayment(bankCode, amountInKobo, phoneNumber) {
        this.logger.log(`Initiating USSD payment: ${bankCode} for ${phoneNumber}`);
        await this.delay(1000);
        const bank = this.getAllNigerianBanks().find(b => b.code === bankCode);
        if (!bank) {
            throw new Error('Unsupported bank for USSD payment');
        }
        const isSuccess = Math.random() > 0.05;
        return {
            status: isSuccess,
            message: isSuccess ? 'USSD payment initiated successfully' : 'USSD payment failed',
            data: isSuccess ? {
                reference: `USSD_${Date.now()}`,
                bank_name: bank.name,
                ussd_code: bank.ussd,
                phone_number: phoneNumber,
                amount: amountInKobo,
                currency: 'NGN',
                status: 'pending',
                instructions: `Dial ${bank.ussd} on ${phoneNumber} and follow the prompts to complete payment`,
                session_id: `SESSION_${Date.now()}`
            } : null
        };
    }
};
exports.MockPaystackService = MockPaystackService;
exports.MockPaystackService = MockPaystackService = MockPaystackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MockPaystackService);
//# sourceMappingURL=mock-paystack.service.js.map