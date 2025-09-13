import { OffersService } from './offers.service';
import { CreateOfferDto, CounterOfferDto, OfferResponse, GetOffersResponse, OfferStatsResponse } from './dto';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    createOffer(userId: string, createOfferDto: CreateOfferDto): Promise<OfferResponse>;
    getOffers(userId: string, type: "sent" | "received" | undefined, page: number, limit: number): Promise<GetOffersResponse>;
    getOfferStats(userId: string): Promise<OfferStatsResponse>;
    getOffersForListing(userId: string, listingId: string, page: number, limit: number): Promise<GetOffersResponse>;
    getOfferById(userId: string, id: string): Promise<OfferResponse>;
    acceptOffer(userId: string, id: string): Promise<OfferResponse>;
    rejectOffer(userId: string, id: string): Promise<OfferResponse>;
    createCounterOffer(userId: string, id: string, counterOfferDto: CounterOfferDto): Promise<OfferResponse>;
    withdrawOffer(userId: string, id: string): Promise<OfferResponse>;
}
