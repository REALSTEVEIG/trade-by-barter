import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { SecurityService } from './security.service'
import { NigerianComplianceService } from './nigerian-compliance.service'

@Module({
  imports: [
    // Rate limiting for Nigerian networks - adjusted for varying speeds
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000, // 1 minute window in milliseconds
      limit: 100, // Higher limit for legitimate Nigerian users
    }, {
      name: 'medium',
      ttl: 600000, // 10 minute window
      limit: 500,
    }, {
      name: 'long',
      ttl: 3600000, // 1 hour window
      limit: 2000,
    }]),
  ],
  providers: [
    SecurityService,
    NigerianComplianceService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    SecurityService,
    NigerianComplianceService,
  ],
})
export class SecurityModule {}