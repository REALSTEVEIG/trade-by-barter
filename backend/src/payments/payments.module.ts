import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MockPaystackService } from './services/mock-paystack.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MockPaystackService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}