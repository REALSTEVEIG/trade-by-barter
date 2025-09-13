import { CreateListingDto } from './create-listing.dto';
export declare enum ListingStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    SOLD = "SOLD",
    PAUSED = "PAUSED",
    EXPIRED = "EXPIRED",
    REMOVED = "REMOVED"
}
declare const UpdateListingDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateListingDto>>;
export declare class UpdateListingDto extends UpdateListingDto_base {
    status?: ListingStatus;
}
export {};
