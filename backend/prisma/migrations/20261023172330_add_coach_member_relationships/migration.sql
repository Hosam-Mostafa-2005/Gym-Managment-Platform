-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'REVOKED');

-- CreateEnum
CREATE TYPE "HistorySharingConsent" AS ENUM ('PENDING', 'GRANTED', 'DECLINED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COACHING_INVITATION_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_INVITATION_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_INVITATION_DECLINED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_RELATIONSHIP_TERMINATED';
ALTER TYPE "NotificationType" ADD VALUE 'HISTORY_SHARING_GRANTED';
ALTER TYPE "NotificationType" ADD VALUE 'HISTORY_SHARING_REVOKED';

-- CreateTable
CREATE TABLE "coach_member_relationships" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'PENDING',
    "historySharingConsent" "HistorySharingConsent" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "historyConsentAt" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_member_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_member_relationships_trainerId_status_isActive_idx" ON "coach_member_relationships"("trainerId", "status", "isActive");

-- CreateIndex
CREATE INDEX "coach_member_relationships_memberId_status_isActive_idx" ON "coach_member_relationships"("memberId", "status", "isActive");

-- CreateIndex
CREATE INDEX "coach_member_relationships_trainerId_memberId_idx" ON "coach_member_relationships"("trainerId", "memberId");

-- AddForeignKey
ALTER TABLE "coach_member_relationships" ADD CONSTRAINT "coach_member_relationships_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_member_relationships" ADD CONSTRAINT "coach_member_relationships_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
