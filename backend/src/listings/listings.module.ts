import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { UploadService } from './upload.service';
import { AwsS3Service } from './aws-s3.service';
import { LocationsService } from '../common/services/locations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ListingsController],
  providers: [ListingsService, UploadService, AwsS3Service, LocationsService],
  exports: [ListingsService, UploadService, LocationsService],
})
export class ListingsModule {}