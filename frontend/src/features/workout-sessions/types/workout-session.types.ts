export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Exercise {
  id: string;
  name: string;
  equipment: string[];
  difficulty: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export interface WorkoutSetLog {
  id: string;
  setNumber: number;
  targetReps: string;
  actualReps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  id: string;

  exercise: Exercise;

  exerciseName: string;

  targetSets: number;

  targetReps: string;

  order: number;

  completed: boolean;

  sets?: WorkoutSetLog[];
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  category: string;
  difficulty: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
}

export interface Assignment {
  id: string;

  trainer: Trainer;

  workout: Workout;

  startDate: string;

  endDate: string;

  status: string;
}

export interface WorkoutSession {
  id: string;

  assignment: Assignment;

  status: WorkoutSessionStatus;

  startedAt: string;

  endedAt?: string;

  duration: number;

  progress: number;

  totalRestTime: number;

  activeTrainingTime: number;

  totalVolume: number;

  exercisesCompleted: number;

  setsCompleted: number;
}

export interface WorkoutSessionDetails {
  session: WorkoutSession;

  exerciseLogs: WorkoutExerciseLog[];
}

export interface WorkoutSessionsResponse {
  sessions: WorkoutSession[];

  results: number;
}

export interface StartWorkoutSessionPayload {
  assignment: string;
}

export interface FinishWorkoutSessionPayload {
  notes?: string;
}

export interface CreateWorkoutSetPayload {
  exerciseLog: string;

  setNumber: number;

  targetReps: string;

  actualReps: number;

  weight: number;
}
