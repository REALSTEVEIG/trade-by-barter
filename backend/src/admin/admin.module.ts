import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthService } from './auth/admin-auth.service';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';
import { AdminUsersService } from './users/admin-users.service';
import { AdminUsersController } from './users/admin-users.controller';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'admin-jwt-secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminUsersController,
  ],
  providers: [
    AdminAuthService,
    AdminUsersService,
    AdminJwtGuard,
    AdminRolesGuard,
  ],
  exports: [
    AdminAuthService,
    AdminUsersService,
    AdminJwtGuard,
    AdminRolesGuard,
  ],
})
export class AdminModule {}