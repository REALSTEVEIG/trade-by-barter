import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED',
}

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @IsOptional()
  @IsEnum(ListingStatus, { message: 'Invalid status' })
  status?: ListingStatus;
}