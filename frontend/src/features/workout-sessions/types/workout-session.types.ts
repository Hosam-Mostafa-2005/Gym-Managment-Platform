export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Exercise {
  id: string;
  name: string;
  equipment: string[];
  difficulty: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  description?: string;
  instructions?: string[];
  tips?: string[];
  imageUrl?: string | null;
  videoUrl?: string;
}

export interface WorkoutSetLog {
  id: string;
  setNumber: number;
  targetReps: string;
  actualReps: number;
  weight: number;
  restDuration?: number;
  setType?: "NORMAL" | "DROP_SET" | "REST_PAUSE" | "WARMUP";
  segmentIndex?: number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
  completedAt?: string;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  id: string;
  exerciseId?: string;
  exercise: Exercise;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: number | null;
  targetRpe?: number | null;
  restSeconds?: number;
  previousBestSet?: { weight: number; actualReps: number } | null;
  originalExerciseId?: string | null;
  originalExercise?: { id: string; name: string; imageUrl?: string | null } | null;
  swapReason?: string | null;
  order: number;
  completed: boolean;
  setsDetail?: any;
  sets: WorkoutSetLog[];
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  estimatedDuration: number;
  category: string;
  difficulty: string;
  imageUrl?: string | null;
  exerciseCount?: number;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
}

export interface Assignment {
  id: string;
  trainer?: Trainer;
  workout?: Workout;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface WorkoutSession {
  id: string;
  assignment?: Assignment | null;
  workout?: Workout | null;
  workoutId?: string | null;
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
  notes?: string;
  sessionRpe?: number | null;
  coachFeedback?: string | null;
  coachReviewedAt?: string | null;
  coachReviewedById?: string | null;
  coachReviewedBy?: { id: string; name: string; email: string } | null;
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
  assignment?: string;
  workout?: string;
}

export interface FinishWorkoutSessionPayload {
  notes?: string;
  sessionRpe?: number;
}

export interface ReviewWorkoutSessionPayload {
  feedback: string;
}

export interface CreateWorkoutSetPayload {
  exerciseLog: string;
  setNumber: number;
  targetReps?: string | number;
  actualReps?: number;
  weight?: number;
  completed?: boolean;
  setType?: "NORMAL" | "DROP_SET" | "REST_PAUSE" | "WARMUP";
  segmentIndex?: number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
}

export interface UpdateWorkoutSetPayload {
  weight?: number;
  actualReps?: number;
  completed?: boolean;
  restDuration?: number;
  setType?: "NORMAL" | "DROP_SET" | "REST_PAUSE" | "WARMUP";
  segmentIndex?: number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
}

export interface SwapExercisePayload {
  newExerciseId: string;
  reason: string;
  notes?: string;
}

export interface PreviousSetPerformance {
  setNumber: number;
  actualReps: number;
  weight: number;
  restDuration?: number;
  completed: boolean;
  setType?: string;
  segmentIndex?: number;
}

export interface PreviousExercisePerformance {
  sessionId: string;
  sessionDate: string | null;
  workoutTitle: string;
  totalVolume?: number;
  maxWeight?: number;
  totalReps?: number;
  bestSet?: { weight: number; actualReps: number } | null;
  sets: PreviousSetPerformance[];
}

export type PreviousPerformanceMap = Record<
  string,
  PreviousExercisePerformance | null
>;

export type ScheduledWorkoutStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface ScheduledWorkout {
  id: string;
  memberId: string;
  workoutId: string;
  assignmentId?: string | null;
  scheduledAt: string;
  status: ScheduledWorkoutStatus;
  notes?: string | null;
  sessionId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workout?: {
    id: string;
    title: string;
    description?: string;
    estimatedDuration: number;
    category: string;
    difficulty: string;
    exercises?: Array<{
      id: string;
      order: number;
      sets: number;
      reps: string;
      exercise?: {
        id: string;
        name: string;
      };
    }>;
  };
  assignment?: {
    id: string;
    trainer?: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
}

export interface CreateScheduledWorkoutPayload {
  workoutId: string;
  scheduledAt: string;
  assignmentId?: string;
  notes?: string;
}

export interface UpdateScheduledWorkoutPayload {
  scheduledAt?: string;
  notes?: string;
  status?: ScheduledWorkoutStatus;
}

export interface AddExerciseToSessionPayload {
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  restTimeSeconds?: number;
  notes?: string;
}
