export declare enum WebhookEventType {
    CHARGE_SUCCESS = "charge.success",
    CHARGE_FAILED = "charge.failed",
    TRANSFER_SUCCESS = "transfer.success",
    TRANSFER_FAILED = "transfer.failed"
}
export declare class PaymentWebhookDto {
    event: WebhookEventType;
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        amount: number;
        message: string;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: Record<string, any>;
        fees: number;
        fees_split: any;
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            channel: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
            reusable: boolean;
            signature: string;
        };
        customer: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            metadata: Record<string, any>;
        };
    };
    signature?: string;
    timestamp?: string;
}
export declare class WebhookVerificationDto {
    isValid: boolean;
    reference: string;
    status: string;
    error?: string;
}
