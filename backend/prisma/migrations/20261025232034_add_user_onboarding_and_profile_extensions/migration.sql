-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coachingPhilosophy" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "fitnessGoal" TEXT,
ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "professionalTitle" TEXT;

-- Existing users are considered already established and onboarded
UPDATE "users" SET "onboardingCompleted" = true, "onboardingStep" = 2;
