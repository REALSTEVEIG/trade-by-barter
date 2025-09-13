# Offers & Swap Flows API Documentation

This module implements the comprehensive offers and trading system for TradeByBarter, supporting cash, swap, and hybrid transactions in the Nigerian market context.

## Features Implemented

### Core Offer Types
- **Cash Offers**: Traditional purchase with Nigerian Naira (₦)
- **Swap Offers**: Item-for-item exchange without cash
- **Hybrid Offers**: Item + cash top-up combinations

### Trading Flows
- **Pure Swap**: Item A <-> Item B (no cash involved)
- **Cash Sale**: Item A → Cash (traditional sale)
- **Hybrid Swap**: Item A + Cash <-> Item B (swap with cash top-up)

### Negotiation System
- Counteroffers with full negotiation chains
- Maximum 5 counteroffers per listing
- Status tracking throughout negotiation
- Automatic offer expiration (7 days default)

### Business Rules
- Users cannot offer on their own listings
- Cash amounts stored in kobo, displayed in Naira (₦)
- Offered listings must be available and owned by offerer
- Comprehensive validation for each offer type
- Rate limiting and authorization

## API Endpoints

### Create Offer
```http
POST /api/v1/offers
Authorization: Bearer <token>
Content-Type: application/json

# Cash Offer Example
{
  "listingId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "CASH",
  "cashAmount": 85000000,
  "message": "I'm interested in buying this iPhone. Is the price negotiable?"
}

# Swap Offer Example
{
  "listingId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "SWAP",
  "offeredListingIds": ["550e8400-e29b-41d4-a716-446655440001"],
  "message": "Would you like to swap for my Samsung Galaxy S21?"
}

# Hybrid Offer Example
{
  "listingId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "HYBRID",
  "cashAmount": 30000000,
  "offeredListingIds": ["550e8400-e29b-41d4-a716-446655440001"],
  "message": "My phone plus ₦300,000 for your iPhone?"
}
```

### Get User Offers
```http
GET /api/v1/offers?type=received&page=1&limit=20
Authorization: Bearer <token>

# Query Parameters:
# type: "sent" | "received" (default: "received")
# page: number (default: 1)
# limit: number (default: 20)
```

### Get Offer Details
```http
GET /api/v1/offers/{offerId}
Authorization: Bearer <token>
```

### Accept Offer
```http
PUT /api/v1/offers/{offerId}/accept
Authorization: Bearer <token>

# Only listing owners can accept offers
```

### Reject Offer
```http
PUT /api/v1/offers/{offerId}/reject
Authorization: Bearer <token>

# Only listing owners can reject offers
```

### Create Counteroffer
```http
POST /api/v1/offers/{offerId}/counter
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "CASH",
  "cashAmount": 90000000,
  "message": "Thanks for your offer! How about ₦900,000?"
}
```

### Withdraw Offer
```http
DELETE /api/v1/offers/{offerId}
Authorization: Bearer <token>

# Only offer creators can withdraw their offers
```

### Get Offers for Listing
```http
GET /api/v1/offers/listing/{listingId}?page=1&limit=20
Authorization: Bearer <token>

# Only listing owners can view offers for their listings
```

### Get Offer Statistics
```http
GET /api/v1/offers/stats
Authorization: Bearer <token>
```

## Response Examples

### Offer Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "CASH",
  "status": "PENDING",
  "cashAmount": 85000000,
  "displayCashAmount": "₦850,000",
  "message": "I'm interested in buying this iPhone",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-08T10:30:00.000Z",
  "listing": {
    "id": "listing-1",
    "title": "iPhone 13 Pro Max 256GB",
    "owner": {
      "id": "user-2",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "isPhoneVerified": true,
      "averageRating": 4.5,
      "totalReviews": 10
    }
  },
  "offerer": {
    "id": "user-1",
    "firstName": "Jane",
    "lastName": "Smith",
    "isPhoneVerified": true,
    "averageRating": 4.2,
    "totalReviews": 5
  },
  "isOfferer": true,
  "isListingOwner": false
}
```

### Swap Offer Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "SWAP",
  "status": "PENDING",
  "message": "Would you like to swap for my phone?",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-08T10:30:00.000Z",
  "listing": {
    "id": "listing-1",
    "title": "iPhone 13 Pro Max 256GB",
    "owner": {
      "id": "user-2",
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "offerer": {
    "id": "user-1",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "offeredListings": [
    {
      "id": "listing-2",
      "title": "Samsung Galaxy S21 Ultra",
      "category": "ELECTRONICS",
      "condition": "LIKE_NEW",
      "price": 75000000,
      "displayPrice": "₦750,000",
      "images": ["image1.jpg", "image2.jpg"],
      "owner": {
        "id": "user-1",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "isOfferer": true,
  "isListingOwner": false
}
```

### Offer Statistics Response
```json
{
  "totalSent": 15,
  "totalReceived": 23,
  "pendingSent": 3,
  "pendingReceived": 5,
  "totalAccepted": 8,
  "totalRejected": 12,
  "successRate": 53.3,
  "averageResponseTime": 18.5,
  "totalValueInKobo": 450000000,
  "displayTotalValue": "₦4,500,000"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Cash amount is required for CASH offers",
  "error": "Bad Request"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You cannot make an offer on your own listing",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Listing not found or is not available",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "You already have a pending offer on this listing",
  "error": "Conflict"
}
```

## Business Logic

### Offer Type Validation
- **CASH**: Requires `cashAmount`, cannot include `offeredListingIds`
- **SWAP**: Requires `offeredListingIds`, cannot include `cashAmount`
- **HYBRID**: Requires both `cashAmount` and `offeredListingIds`

### Status Transitions
```
PENDING → ACCEPTED (creates transaction)
PENDING → REJECTED (offer closed)
PENDING → COUNTERED (creates new counter-offer)
PENDING → EXPIRED (automatic after 7 days)
PENDING → WITHDRAWN (by offerer)
```

### Authorization Rules
- Users can only view offers they're involved in (sender or receiver)
- Only listing owners can accept/reject offers
- Only offer creators can withdraw offers
- Only listing owners can create counteroffers

### Nigerian Market Features
- All amounts in kobo (100 kobo = 1 Naira)
- Formatted display with ₦ symbol and comma separators
- Location-aware trading preferences
- Cultural considerations in messaging and negotiations

## Notifications

The system automatically creates notifications for:
- `OFFER_RECEIVED`: New offer on your listing
- `OFFER_ACCEPTED`: Your offer was accepted
- `OFFER_REJECTED`: Your offer was rejected
- `COUNTEROFFER_RECEIVED`: Someone countered your offer
- `OFFER_EXPIRED`: Your offer has expired
- `OFFER_WITHDRAWN`: An offer was withdrawn

## Testing

Run the test suite:
```bash
npm run test -- offers.controller.spec.ts
```

The tests cover:
- All offer types (cash, swap, hybrid)
- Status transitions and business rules
- Authorization and validation
- Error scenarios
- Counteroffer functionality
- Statistics and pagination

## Future Enhancements

- Bulk offer operations
- Smart matching suggestions
- Offer templates
- Advanced analytics
- Integration with payment gateways
- Escrow services for high-value trades