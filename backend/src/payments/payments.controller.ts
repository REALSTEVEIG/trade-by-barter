import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { TopupWalletDto, TopupResponseDto } from './dto/topup-wallet.dto';
import { WithdrawFundsDto, WithdrawResponseDto } from './dto/withdraw-funds.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentMethodResponseDto, PaymentStatusResponseDto, NigerianBankDto } from './dto/payment-response.dto';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('topup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Top up wallet',
    description: 'Initialize wallet top-up payment with Nigerian payment providers (mock implementation)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initialization successful',
    type: TopupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async topupWallet(
    @GetUser('id') userId: string,
    @Body() topupData: TopupWalletDto,
  ): Promise<TopupResponseDto> {
    this.logger.log(`Wallet topup request from user: ${userId}`);
    return this.paymentsService.topupWallet(userId, topupData);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payment webhook handler',
    description: 'Handle payment provider webhooks for payment confirmations (mock implementation)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook data',
  })
  async handleWebhook(
    @Body() webhookData: PaymentWebhookDto,
    @Headers('x-paystack-signature') signature?: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Webhook received: ${webhookData.event}`);
    
    // Add signature to webhook data for verification
    const webhookWithSignature = {
      ...webhookData,
      signature,
    };

    return this.paymentsService.handleWebhook(webhookWithSignature);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Withdraw funds',
    description: 'Withdraw funds from wallet to Nigerian bank account (mock implementation)',
  })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal initiated successfully',
    type: WithdrawResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or insufficient balance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async withdrawFunds(
    @GetUser('id') userId: string,
    @Body() withdrawData: WithdrawFundsDto,
  ): Promise<WithdrawResponseDto> {
    this.logger.log(`Withdrawal request from user: ${userId}`);
    return this.paymentsService.withdrawFunds(userId, withdrawData);
  }

  @Get('methods')
  @ApiOperation({
    summary: 'Get payment methods',
    description: 'Get available Nigerian payment methods and their details',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
    type: [PaymentMethodResponseDto],
  })
  async getPaymentMethods(): Promise<PaymentMethodResponseDto[]> {
    this.logger.log('Payment methods requested');
    return this.paymentsService.getPaymentMethods();
  }

  @Get('status/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment status',
    description: 'Check the status of a payment transaction',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    type: PaymentStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getPaymentStatus(
    @Param('reference') reference: string,
  ): Promise<PaymentStatusResponseDto> {
    this.logger.log(`Payment status check for reference: ${reference}`);
    return this.paymentsService.getPaymentStatus(reference);
  }

  @Get('banks')
  @ApiOperation({
    summary: 'Get Nigerian banks',
    description: 'Get list of supported Nigerian banks for transfers',
  })
  @ApiResponse({
    status: 200,
    description: 'Nigerian banks retrieved successfully',
    type: [NigerianBankDto],
  })
  async getNigerianBanks(): Promise<NigerianBankDto[]> {
    this.logger.log('Nigerian banks list requested');
    return this.paymentsService.getNigerianBanks();
  }

  @Post('verify/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify payment',
    description: 'Manually verify payment status with provider (for testing)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verification completed',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async verifyPayment(
    @Param('reference') reference: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.log(`Manual payment verification for reference: ${reference}`);
    
    try {
      const paymentStatus = await this.paymentsService.getPaymentStatus(reference);
      
      return {
        success: true,
        message: 'Payment verification completed',
        data: paymentStatus,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Payment verification failed',
      };
    }
  }
}