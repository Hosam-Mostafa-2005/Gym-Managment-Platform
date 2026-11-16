-- AlterTable
ALTER TABLE "workout_exercise_logs" ADD COLUMN IF NOT EXISTS "isRemoved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "workout_exercise_logs_sessionId_isRemoved_idx" ON "workout_exercise_logs"("sessionId", "isRemoved");
