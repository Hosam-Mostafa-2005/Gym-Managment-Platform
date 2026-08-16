import type { User } from "@/features/auth/types/auth.types";
import type { Assignment } from "@/features/assignments/types/assignment.types";
import type {
  WorkoutSession,
  WorkoutSessionDetails,
} from "@/features/workout-sessions/types/workout-session.types";

export interface HomeStats {
  totalExercises: number;
  totalWorkouts: number;
  totalSessions: number;
  completedSessions: number;
}

export interface HomeData {
  user: User;
  activeAssignment: Assignment | null;
  currentSession: WorkoutSessionDetails | null;
  recentSessions: WorkoutSession[];
  stats: HomeStats;
}
