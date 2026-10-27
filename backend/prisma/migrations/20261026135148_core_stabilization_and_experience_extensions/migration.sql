-- AlterTable
ALTER TABLE "workout_exercise_logs" ADD COLUMN     "originalExerciseId" TEXT,
ADD COLUMN     "swapReason" TEXT,
ADD COLUMN     "targetRpe" DOUBLE PRECISION,
ADD COLUMN     "targetWeight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "workout_exercises" ADD COLUMN     "targetRpe" DOUBLE PRECISION,
ADD COLUMN     "targetWeight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "workout_sessions" ADD COLUMN     "coachFeedback" TEXT,
ADD COLUMN     "coachReviewedAt" TIMESTAMP(3),
ADD COLUMN     "coachReviewedById" TEXT,
ADD COLUMN     "sessionRpe" INTEGER;

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "parentWorkoutId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "member_exercise_access" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_exercise_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_exercise_access_memberId_isActive_idx" ON "member_exercise_access"("memberId", "isActive");

-- CreateIndex
CREATE INDEX "member_exercise_access_exerciseId_idx" ON "member_exercise_access"("exerciseId");

-- CreateIndex
CREATE INDEX "member_exercise_access_grantedById_idx" ON "member_exercise_access"("grantedById");

-- CreateIndex
CREATE UNIQUE INDEX "member_exercise_access_memberId_exerciseId_key" ON "member_exercise_access"("memberId", "exerciseId");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_parentWorkoutId_fkey" FOREIGN KEY ("parentWorkoutId") REFERENCES "workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_coachReviewedById_fkey" FOREIGN KEY ("coachReviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_exercise_access" ADD CONSTRAINT "member_exercise_access_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_exercise_access" ADD CONSTRAINT "member_exercise_access_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_exercise_access" ADD CONSTRAINT "member_exercise_access_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
