-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CHECK_IN', 'PROGRESS_REVIEW', 'CONSULTATION', 'ASSESSMENT', 'FORM_ANALYSIS', 'GOAL_SETTING', 'NUTRITION_SYNC');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COACHING_APPOINTMENT_SCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_APPOINTMENT_RESCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_APPOINTMENT_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE 'WORKOUT_SCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'WORKOUT_SCHEDULE_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'WORKOUT_SCHEDULE_CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ScheduledWorkoutStatus" ADD VALUE 'MISSED';
ALTER TYPE "ScheduledWorkoutStatus" ADD VALUE 'RESCHEDULED';

-- AlterTable
ALTER TABLE "scheduled_workouts" ADD COLUMN     "trainerId" TEXT;

-- CreateTable
CREATE TABLE "coaching_appointments" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL DEFAULT 'CHECK_IN',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "memberNotes" TEXT,
    "coachNotes" TEXT,
    "cancellationReason" TEXT,
    "cancelledBy" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coaching_appointments_trainerId_startTime_endTime_idx" ON "coaching_appointments"("trainerId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "coaching_appointments_memberId_startTime_endTime_idx" ON "coaching_appointments"("memberId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "coaching_appointments_trainerId_status_isActive_idx" ON "coaching_appointments"("trainerId", "status", "isActive");

-- CreateIndex
CREATE INDEX "coaching_appointments_memberId_status_isActive_idx" ON "coaching_appointments"("memberId", "status", "isActive");

-- CreateIndex
CREATE INDEX "scheduled_workouts_trainerId_scheduledAt_idx" ON "scheduled_workouts"("trainerId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_appointments" ADD CONSTRAINT "coaching_appointments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_appointments" ADD CONSTRAINT "coaching_appointments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
