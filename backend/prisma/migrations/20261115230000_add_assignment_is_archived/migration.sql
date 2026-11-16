-- AlterTable
ALTER TABLE "assignments" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "assignments" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "assignments_memberId_isArchived_isActive_idx" ON "assignments"("memberId", "isArchived", "isActive");
