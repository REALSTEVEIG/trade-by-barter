# TradeByBarter Backend - Database Foundation

## Overview

This is the backend database foundation for TradeByBarter, a Nigerian barter marketplace. The database is built with PostgreSQL and Prisma ORM, designed specifically for the Nigerian market context.

## Database Schema

The database includes 11 core models designed for a comprehensive barter marketplace:

### Core Models

1. **User** - User accounts with Nigerian context (phone verification, location, ratings)
2. **Listing** - Marketplace items with categories, pricing in kobo, swap options
3. **Offer** - Trade offers supporting cash top-up and swap combinations
4. **Transaction** - Payment tracking and escrow management
5. **Wallet** - User balance management in kobo
6. **Chat & Message** - Communication system between users
7. **Review** - Ratings and feedback system
8. **Verification** - KYC and trust badge system
9. **Media** - File attachment management
10. **Notification** - User alert system
11. **AdminAudit** - Moderation and admin action tracking

### Nigerian Context Features

- **Monetary Values**: All amounts stored in kobo (1 Naira = 100 kobo)
- **Phone Numbers**: Nigerian format (+234XXXXXXXXX)
- **Locations**: Nigerian cities and states
- **Categories**: Popular Nigerian marketplace categories
- **Payment Methods**: Nigerian payment providers (Paystack, Flutterwave)

## Database Setup

### Prerequisites

- PostgreSQL database running on localhost:5432
- Database name: `tradebybarter`
- User: `postgres`
- Password: `_sUITANGI1738`

### Environment Configuration

The database connection is configured in `.env`:

```env
DATABASE_URL="postgresql://postgres:_sUITANGI1738@localhost:5432/tradebybarter"
```

### Setup Commands

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```

3. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed database with Nigerian data**:
   ```bash
   npm run db:seed
   ```

5. **Open Prisma Studio** (database browser):
   ```bash
   npm run db:studio
   ```

### Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (dev only)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Seed Data

The seed script (`prisma/seed.ts`) populates the database with realistic Nigerian marketplace data:

- **20 users** with authentic Nigerian names (Adebayo, Chioma, Kemi, etc.)
- **15 listings** across popular categories (electronics, vehicles, fashion, etc.)
- **30 offers** with various trade types (cash-only, swap-only, hybrid)
- **20 transactions** with Nigerian payment methods
- **15 chat conversations** with messages
- **25 reviews** with ratings and feedback
- **15 verifications** for KYC compliance
- **40 notifications** for user engagement

### Sample Data Features

- Nigerian phone numbers starting with +234
- Cities across Nigeria (Lagos, Abuja, Port Harcourt, Kano, etc.)
- Realistic pricing in Naira (stored as kobo)
- Popular Nigerian items (generators, Ankara fabrics, etc.)
- No emojis in any data (compliance requirement)

## Schema Features

### Relationships

- Users have wallets, listings, offers, transactions, chats, reviews
- Listings belong to users and can have multiple offers
- Offers connect buyers and sellers with optional swap items
- Transactions track payments between users
- Chats contain messages between users
- Reviews provide feedback between users

### Indexes

Optimized indexes for:
- User lookups (phone, email, location)
- Listing searches (category, location, price, status)
- Offer management (sender, receiver, listing)
- Transaction tracking (payment reference, status)
- Message retrieval (chat, sender, timestamp)

### Constraints

- UUID primary keys for all models
- Unique constraints on email, phone, payment references
- Foreign key relationships with cascade deletes where appropriate
- Enum types for consistent data values

## TypeScript Integration

The schema generates TypeScript types automatically via Prisma Client:

```typescript
import { PrismaClient, User, Listing, Offer } from '@prisma/client';

const prisma = new PrismaClient();

// Type-safe database operations
const user: User = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

## Migration Management

Migrations are stored in `prisma/migrations/` and track schema changes:

- Initial migration: `20250909142906_init`
- Contains all 11 models with indexes and constraints
- Supports PostgreSQL-specific features (UUID, JSONB)

## Development Workflow

1. Modify schema in `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name feature_name`
3. Generate client: `npm run db:generate`
4. Update seed data if needed: `npm run db:seed`
5. Test with Prisma Studio: `npm run db:studio`

## Production Considerations

- Use environment variables for database credentials
- Set up database backup strategies
- Monitor query performance with indexes
- Implement connection pooling for scaling
- Regular database maintenance and optimization

## Nigerian Market Optimizations

The schema is specifically optimized for the Nigerian market:

- **Currency**: Kobo storage prevents floating-point precision issues
- **Phone Verification**: Essential for Nigerian e-commerce trust
- **Location-based**: City/state structure matches Nigerian geography
- **Payment Integration**: Ready for Nigerian payment gateways
- **Category Structure**: Reflects popular Nigerian marketplace items
