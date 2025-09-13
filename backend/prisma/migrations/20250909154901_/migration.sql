-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."EscrowStatus" AS ENUM ('CREATED', 'FUNDED', 'DISPUTED', 'RELEASED', 'REFUNDED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'WALLET_TOPUP_SUCCESS';
ALTER TYPE "public"."NotificationType" ADD VALUE 'WALLET_TOPUP_FAILED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'WALLET_LOW_BALANCE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'ESCROW_CREATED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'ESCROW_RELEASED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'ESCROW_DISPUTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'TRANSFER_RECEIVED';

-- AlterEnum
ALTER TYPE "public"."PaymentMethod" ADD VALUE 'MOBILE_MONEY';

-- AlterEnum
ALTER TYPE "public"."PaymentProvider" ADD VALUE 'MOCK_PROVIDER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TransactionType" ADD VALUE 'WALLET_TOPUP';
ALTER TYPE "public"."TransactionType" ADD VALUE 'WALLET_WITHDRAWAL';
ALTER TYPE "public"."TransactionType" ADD VALUE 'ESCROW_REFUND';
ALTER TYPE "public"."TransactionType" ADD VALUE 'TRANSFER_SENT';
ALTER TYPE "public"."TransactionType" ADD VALUE 'TRANSFER_RECEIVED';
ALTER TYPE "public"."TransactionType" ADD VALUE 'FEE_CHARGE';

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "description" TEXT,
ADD COLUMN     "escrowId" UUID,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "paymentId" UUID;

-- AlterTable
ALTER TABLE "public"."Wallet" ADD COLUMN     "lastTransactionAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "amountInKobo" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "paymentProvider" "public"."PaymentProvider" NOT NULL,
    "channel" TEXT,
    "authorizationCode" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "feeInKobo" INTEGER,
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "webhookVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Escrow" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "amountInKobo" INTEGER NOT NULL,
    "feeInKobo" INTEGER NOT NULL,
    "status" "public"."EscrowStatus" NOT NULL DEFAULT 'CREATED',
    "description" TEXT,
    "releaseCondition" TEXT,
    "disputeReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "disputeOpenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buyerId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "offerId" UUID NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "public"."Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "public"."Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_reference_idx" ON "public"."Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paymentProvider_idx" ON "public"."Payment"("paymentProvider");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Escrow_reference_key" ON "public"."Escrow"("reference");

-- CreateIndex
CREATE INDEX "Escrow_buyerId_idx" ON "public"."Escrow"("buyerId");

-- CreateIndex
CREATE INDEX "Escrow_sellerId_idx" ON "public"."Escrow"("sellerId");

-- CreateIndex
CREATE INDEX "Escrow_offerId_idx" ON "public"."Escrow"("offerId");

-- CreateIndex
CREATE INDEX "Escrow_status_idx" ON "public"."Escrow"("status");

-- CreateIndex
CREATE INDEX "Escrow_expiresAt_idx" ON "public"."Escrow"("expiresAt");

-- CreateIndex
CREATE INDEX "Escrow_createdAt_idx" ON "public"."Escrow"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_escrowId_idx" ON "public"."Transaction"("escrowId");

-- CreateIndex
CREATE INDEX "Transaction_paymentId_idx" ON "public"."Transaction"("paymentId");

-- CreateIndex
CREATE INDEX "Wallet_lastTransactionAt_idx" ON "public"."Wallet"("lastTransactionAt");

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "public"."Escrow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Escrow" ADD CONSTRAINT "Escrow_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Escrow" ADD CONSTRAINT "Escrow_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Escrow" ADD CONSTRAINT "Escrow_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
