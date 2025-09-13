# TradeByBarter Developer Guide

## Overview

TradeByBarter is a Nigerian marketplace platform that enables users to exchange goods and services through bartering, with optional cash transactions. This guide provides comprehensive documentation for developers working on the platform.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Nigerian Market Features](#nigerian-market-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Architecture Overview

TradeByBarter follows a modern microservices architecture optimized for the Nigerian market:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile App     │    │  Admin Panel    │
│   (Next.js)     │    │ (React Native)  │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              API Gateway                        │
         │           (Load Balancer)                       │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │           Backend Services                      │
         │             (NestJS)                            │
         ├─────────────────────────────────────────────────┤
         │ • Authentication Service                        │
         │ • User Management Service                       │
         │ • Listing Management Service                    │
         │ • Barter Transaction Service                    │
         │ • Notification Service                          │
         │ • Search & Analytics Service                    │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Data Layer                         │
         ├─────────────────────────────────────────────────┤
         │ • PostgreSQL (Primary Database)                 │
         │ • Redis (Caching & Sessions)                    │
         │ • CloudFlare R2 (File Storage)                  │
         │ • Elasticsearch (Search Index)                  │
         └─────────────────────────────────────────────────┘
```

### Key Technologies

- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js 14 with TypeScript
- **Mobile**: React Native with Expo
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **File Storage**: CloudFlare R2
- **Search**: Elasticsearch
- **Authentication**: JWT with refresh tokens
- **Testing**: Jest, Supertest, React Testing Library
- **Documentation**: OpenAPI/Swagger

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- PostgreSQL 14+
- Redis 6+
- Git
- Docker (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/tradebybarter/platform.git
cd platform

# Install dependencies for all services
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev:all
```

## Development Environment Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Required environment variables for Nigerian deployment:
# DATABASE_URL="postgresql://user:password@localhost:5432/tradebybarter"
# REDIS_URL="redis://localhost:6379"
# JWT_SECRET="your-secure-jwt-secret"
# SMS_PROVIDER_API_KEY="nigerian-sms-provider-key"
# PAYSTACK_SECRET_KEY="your-paystack-secret"
# CLOUDFLARE_R2_ACCESS_KEY="your-r2-key"

# Run database migrations
npm run db:migrate

# Seed database with Nigerian data
npm run db:seed

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Required environment variables:
# NEXT_PUBLIC_API_URL="http://localhost:3001"
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your-paystack-public-key"
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-api-key"

# Start development server
npm run dev
```

### 3. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Install Expo CLI
npm install -g @expo/cli

# Start Expo development server
npm run start
```

## Project Structure

```
tradebybarter/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── listings/       # Product listings
│   │   ├── barter/         # Barter transactions
│   │   ├── notifications/  # Push notifications
│   │   ├── common/         # Shared utilities
│   │   ├── dto/            # Data Transfer Objects
│   │   └── main.ts         # Application entry point
│   ├── test/               # Integration & E2E tests
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── web/                    # Next.js web application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript types
│   └── package.json
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   ├── components/    # Mobile components
│   │   ├── navigation/    # Navigation setup
│   │   └── services/      # API services
│   └── package.json
├── admin/                  # Admin panel
├── docs/                   # Documentation
└── infrastructure/         # Deployment configs
```

## API Documentation

### Authentication Endpoints

#### POST `/auth/register`
Register a new Nigerian user account.

**Request Body:**
```json
{
  "fullName": "Adebayo Oladimeji",
  "phone": "+2348012345678",
  "email": "adebayo@example.com",
  "password": "SecurePass123!",
  "location": "Lagos",
  "referralCode": "REF123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123456789",
    "fullName": "Adebayo Oladimeji",
    "phone": "+2348012345678",
    "email": "adebayo@example.com",
    "location": "Lagos",
    "isVerified": false,
    "reputationScore": 0
  }
}
```

#### POST `/auth/login`
Authenticate user with Nigerian phone number.

**Request Body:**
```json
{
  "phone": "+2348012345678",
  "password": "SecurePass123!"
}
```

### Listing Endpoints

#### GET `/listings`
Search and filter marketplace listings.

**Query Parameters:**
- `q`: Search query
- `categoryId`: Category filter
- `location`: Nigerian state/city filter
- `minPrice`: Minimum price in Naira
- `maxPrice`: Maximum price in Naira
- `condition`: Item condition filter
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "lst_123456789",
      "title": "iPhone 13 Pro Max 256GB",
      "description": "Excellent condition...",
      "estimatedValue": 450000,
      "condition": "like_new",
      "location": "Lagos",
      "images": ["https://cdn.tradebybarter.ng/..."],
      "owner": {
        "id": "usr_123456789",
        "fullName": "Adebayo Oladimeji",
        "reputationScore": 95,
        "isVerified": true
      },
      "createdAt": "2024-03-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST `/listings`
Create a new marketplace listing.

**Request Body:**
```json
{
  "title": "MacBook Pro 2023 16-inch",
  "description": "Brand new MacBook Pro with M3 chip...",
  "categoryId": "cat_electronics_001",
  "condition": "new",
  "estimatedValue": 1200000,
  "location": "Abuja",
  "images": ["https://cdn.tradebybarter.ng/..."],
  "lookingFor": "iPhone 15 Pro or cash equivalent",
  "tags": ["laptop", "apple", "macbook"],
  "allowCashOffers": true,
  "allowPartialTrade": false
}
```

### Barter Transaction Endpoints

#### POST `/barter/offers`
Create a barter offer on a listing.

**Request Body:**
```json
{
  "listingId": "lst_123456789",
  "offerType": "item_for_item",
  "offeredItems": ["lst_987654321"],
  "cashAmount": 50000,
  "message": "I'd like to trade my laptop for your phone plus ₦50,000",
  "proposedLocation": "Computer Village, Ikeja, Lagos",
  "expiryHours": 72
}
```

#### PUT `/barter/offers/:id/respond`
Respond to a barter offer.

**Request Body:**
```json
{
  "response": "accept",
  "message": "Great offer! I accept your trade proposal."
}
```

## Database Schema

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  location VARCHAR(100) NOT NULL,
  profile_picture TEXT,
  is_verified BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Listings Table
```sql
CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL,
  condition VARCHAR(20) NOT NULL,
  estimated_value INTEGER NOT NULL,
  location VARCHAR(200) NOT NULL,
  images TEXT[] NOT NULL,
  looking_for TEXT,
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  allow_cash_offers BOOLEAN DEFAULT true,
  allow_partial_trade BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

#### Barter Offers Table
```sql
CREATE TABLE barter_offers (
  id TEXT PRIMARY KEY,
  listing_id TEXT REFERENCES listings(id),
  offerer_id TEXT REFERENCES users(id),
  offer_type VARCHAR(30) NOT NULL,
  cash_amount INTEGER,
  offered_items TEXT[],
  message TEXT NOT NULL,
  proposed_location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

## Nigerian Market Features

### 1. Phone Number Validation
Nigerian phone numbers are validated using the format `+234XXXXXXXXX`:

```typescript
// Valid Nigerian prefixes
const NIGERIAN_PREFIXES = [
  '803', '806', '813', '816', '810', '814', '903', '906', '915', // MTN
  '805', '807', '815', '811', '817', '818', '908', '909', '901', // Glo
  '802', '808', '812', '804', '809', '707', '708', '302', '701', // Airtel
  '809', '817', '818', '804', '805', '904', '905', '907', '011'  // 9mobile
];

function validateNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('234') && cleaned.length === 13;
}
```

### 2. Currency Formatting
All prices are displayed in Nigerian Naira with proper formatting:

```typescript
function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount);
}

// Usage: formatNaira(450000) => "₦450,000"
```

### 3. Nigerian Locations
Pre-defined list of Nigerian states and major cities:

```typescript
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
```

### 4. Payment Integration
Integration with Paystack for Nigerian payments:

```typescript
import { Paystack } from '@paystack/inline-js';

const paystack = new Paystack();

paystack.newTransaction({
  key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  email: user.email,
  amount: amount * 100, // Convert to kobo
  currency: 'NGN',
  callback: (response) => {
    // Handle successful payment
    verifyTransaction(response.reference);
  }
});
```

### 5. SMS Verification
SMS verification using Nigerian SMS providers:

```typescript
// Backend service for SMS verification
@Injectable()
export class SmsService {
  async sendVerificationCode(phone: string): Promise<void> {
    const code = this.generateCode();
    const message = `Your TradeByBarter verification code is: ${code}`;
    
    // Use Nigerian SMS provider (e.g., Termii, SMS Dome)
    await this.smsProvider.send({
      to: phone,
      message,
      sender: 'TradeByBarter'
    });
    
    // Store code in Redis with expiry
    await this.redis.setex(`sms:${phone}`, 300, code);
  }
}
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report

# Frontend tests
cd web
npm run test           # Component tests
npm run test:e2e       # Integration tests

# Mobile tests
cd mobile
npm run test
```

### Test Coverage Requirements

- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 75% coverage
- **Mobile**: Minimum 70% coverage

### Nigerian-Specific Test Cases

```typescript
describe('Nigerian Phone Validation', () => {
  it('should accept valid Nigerian phone numbers', () => {
    const validNumbers = [
      '+2348012345678',
      '+2347012345678',
      '+2349012345678'
    ];
    
    validNumbers.forEach(number => {
      expect(validateNigerianPhone(number)).toBe(true);
    });
  });
});

describe('Naira Currency Formatting', () => {
  it('should format Nigerian currency correctly', () => {
    expect(formatNaira(450000)).toBe('₦450,000');
    expect(formatNaira(1500)).toBe('₦1,500');
  });
});
```

## Deployment

### Production Environment

#### Environment Variables
```bash
# Backend Production
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-production-jwt-secret
PAYSTACK_SECRET_KEY=sk_live_...
CLOUDFLARE_R2_ACCESS_KEY=...
SMS_PROVIDER_API_KEY=...

# Frontend Production
NEXT_PUBLIC_API_URL=https://api.tradebybarter.ng
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

#### Deployment Commands
```bash
# Build and deploy backend
cd backend
npm run build
npm run start:prod

# Build and deploy frontend
cd web
npm run build
npm run start

# Deploy mobile app
cd mobile
expo build:android
expo build:ios
```

### Infrastructure Setup

#### Docker Deployment
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3001:3001"
  
  frontend:
    build: ./web
    ports:
      - "3000:3000"
  
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
  
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=tradebybarter
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Nigerian Hosting Recommendations

1. **Primary Hosting**: AWS Africa (Cape Town) or Google Cloud Africa
2. **CDN**: CloudFlare with Nigerian edge locations
3. **Database**: Managed PostgreSQL with backups
4. **File Storage**: CloudFlare R2 or AWS S3
5. **Monitoring**: DataDog or New Relic with Nigerian timezone

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch from `develop`
3. **Implement** your changes with tests
4. **Ensure** all tests pass and coverage requirements are met
5. **Submit** a pull request to `develop` branch

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Conventional commits format

### Nigerian Market Considerations

When contributing, always consider:

- **Currency**: Display all amounts in Nigerian Naira (₦)
- **Phone Numbers**: Use +234 format validation
- **Locations**: Include Nigerian states and cities
- **Time Zones**: Use West Africa Time (WAT)
- **Language**: Use Nigerian English terminology
- **Business Hours**: Consider Nigerian business hours for features

### Pull Request Template

```markdown
## Description
Brief description of changes

## Nigerian Market Impact
How does this change affect Nigerian users?

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Nigerian-specific scenarios tested

## Deployment Notes
Any special deployment considerations for Nigerian infrastructure
```

## Support

- **Documentation**: https://docs.tradebybarter.ng
- **API Reference**: https://api.tradebybarter.ng/docs
- **Developer Support**: dev@tradebybarter.ng
- **Nigerian Business Hours**: Monday-Friday 9AM-6PM WAT

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.