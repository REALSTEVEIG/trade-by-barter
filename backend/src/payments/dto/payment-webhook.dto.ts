import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WebhookEventType {
  CHARGE_SUCCESS = 'charge.success',
  CHARGE_FAILED = 'charge.failed',
  TRANSFER_SUCCESS = 'transfer.success',
  TRANSFER_FAILED = 'transfer.failed',
}

export class PaymentWebhookDto {
  @ApiProperty({
    description: 'Webhook event type',
    enum: WebhookEventType,
    example: WebhookEventType.CHARGE_SUCCESS,
  })
  @IsEnum(WebhookEventType)
  event: WebhookEventType;

  @ApiProperty({
    description: 'Payment data from provider',
  })
  @IsObject()
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

  @ApiPropertyOptional({
    description: 'Webhook signature for verification',
    example: 'signature123',
  })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({
    description: 'Webhook timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class WebhookVerificationDto {
  @ApiProperty({
    description: 'Whether webhook signature is valid',
    example: true,
  })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({
    description: 'Payment reference from webhook',
    example: 'PAY_1234567890',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Payment status from webhook',
    example: 'success',
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'Error message if verification failed',
    example: 'Invalid signature',
  })
  @IsOptional()
  @IsString()
  error?: string;
}