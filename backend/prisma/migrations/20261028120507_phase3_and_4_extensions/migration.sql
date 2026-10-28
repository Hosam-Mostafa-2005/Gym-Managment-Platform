-- AlterTable
ALTER TABLE "foods" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarKey" TEXT,
ADD COLUMN     "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "workout_exercise_logs" ADD COLUMN     "restSeconds" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "workout_exercises" ADD COLUMN     "isRestOverridden" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "restSeconds" SET DEFAULT 60;

-- AlterTable
ALTER TABLE "workout_set_logs" ADD COLUMN     "isFinalSegment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isIntermediateSegment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "segmentIndex" INTEGER DEFAULT 0,
ADD COLUMN     "setType" TEXT NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "defaultRestLarge" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "defaultRestSmall" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "workout_shares" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "shareTokenHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "importCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workout_shares_shareCode_key" ON "workout_shares"("shareCode");

-- CreateIndex
CREATE UNIQUE INDEX "workout_shares_shareTokenHash_key" ON "workout_shares"("shareTokenHash");

-- CreateIndex
CREATE INDEX "workout_shares_shareCode_isActive_idx" ON "workout_shares"("shareCode", "isActive");

-- CreateIndex
CREATE INDEX "workout_shares_shareTokenHash_isActive_idx" ON "workout_shares"("shareTokenHash", "isActive");

-- CreateIndex
CREATE INDEX "workout_shares_workoutId_isActive_idx" ON "workout_shares"("workoutId", "isActive");

-- CreateIndex
CREATE INDEX "foods_userId_isCustom_isActive_idx" ON "foods"("userId", "isCustom", "isActive");

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_shares" ADD CONSTRAINT "workout_shares_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_shares" ADD CONSTRAINT "workout_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
