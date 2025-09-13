import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto, CounterOfferDto, OfferResponse, GetOffersResponse, OfferStatsResponse } from './dto';
export declare class OffersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private formatPrice;
    private getUserSummary;
    private getListingSummary;
    private formatOfferResponse;
    createOffer(userId: string, createOfferDto: CreateOfferDto): Promise<OfferResponse>;
    private validateOfferType;
    private validateOfferedListings;
    private createOfferNotification;
    getOffers(userId: string, type?: 'sent' | 'received', page?: number, limit?: number): Promise<GetOffersResponse>;
    getOfferById(id: string, userId: string): Promise<OfferResponse>;
    acceptOffer(id: string, userId: string): Promise<OfferResponse>;
    rejectOffer(id: string, userId: string): Promise<OfferResponse>;
    withdrawOffer(id: string, userId: string): Promise<OfferResponse>;
    createCounterOffer(id: string, userId: string, counterOfferDto: CounterOfferDto): Promise<OfferResponse>;
    getOffersForListing(listingId: string, userId: string, page?: number, limit?: number): Promise<GetOffersResponse>;
    getOfferStats(userId: string): Promise<OfferStatsResponse>;
    expireOffers(): Promise<void>;
}
