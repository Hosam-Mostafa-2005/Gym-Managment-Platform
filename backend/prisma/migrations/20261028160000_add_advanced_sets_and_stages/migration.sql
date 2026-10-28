-- AlterTable
ALTER TABLE "workout_exercises" ADD COLUMN IF NOT EXISTS "setsDetail" JSONB;

-- AlterTable
ALTER TABLE "workout_exercise_logs" ADD COLUMN IF NOT EXISTS "setsDetail" JSONB;

-- Update existing workout_set_logs and enforce non-null segmentIndex
UPDATE "workout_set_logs" SET "segmentIndex" = 0 WHERE "segmentIndex" IS NULL;
ALTER TABLE "workout_set_logs" ALTER COLUMN "segmentIndex" SET NOT NULL;
ALTER TABLE "workout_set_logs" ALTER COLUMN "segmentIndex" SET DEFAULT 0;

-- Drop existing unique index on [exerciseLogId, setNumber]
DROP INDEX IF EXISTS "workout_set_logs_exerciseLogId_setNumber_key";

-- Create compound unique index on [exerciseLogId, setNumber, segmentIndex]
CREATE UNIQUE INDEX IF NOT EXISTS "workout_set_logs_exerciseLogId_setNumber_segmentIndex_key" ON "workout_set_logs"("exerciseLogId", "setNumber", "segmentIndex");
