import type { Assignment } from "@/features/assignments/types/assignment.types";
import type { WorkoutSession } from "@/features/workout-sessions/types/workout-session.types";

export interface DashboardWorkout {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
}

export interface WorkoutLogExercise {
  id: string;
  name: string;
}

export interface RecentWorkoutLog {
  id: string;

  exercise: WorkoutLogExercise;

  weight: number;

  reps: number;

  performedAt: string;
}

export interface MemberDashboard {
  activeAssignment: Assignment | null;

  totalSessions: number;

  completedSessions: number;

  lastWorkout: WorkoutSession | null;

  recentLogs: RecentWorkoutLog[];
}

export interface TrainerDashboard {
  totalMembers: number;

  totalExercises: number;

  totalWorkouts: number;

  activeAssignments: number;

  activeSessions: number;

  completedSessions: number;
}
