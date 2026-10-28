// src/features/scheduling/types/scheduling.types.ts

export type ScheduledWorkoutStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED"
  | "RESCHEDULED";

export type AppointmentType =
  | "CHECK_IN"
  | "PROGRESS_REVIEW"
  | "CONSULTATION"
  | "ASSESSMENT"
  | "FORM_ANALYSIS"
  | "GOAL_SETTING"
  | "NUTRITION_SYNC";

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

export interface ScheduledWorkout {
  id: string;
  memberId: string;
  workoutId: string;
  assignmentId?: string | null;
  trainerId?: string | null;
  sessionId?: string | null;
  scheduledAt: string;
  status: ScheduledWorkoutStatus;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  workout?: {
    id: string;
    title: string;
    difficulty?: string;
    estimatedDuration?: number;
    exercises?: Array<{
      id: string;
      order: number;
      sets: number;
      reps: number;
      restTime?: number;
      exercise: {
        id: string;
        name: string;
        targetMuscle?: string;
        category?: string;
        imageUrl?: string | null;
      };
    }>;
  };
  trainer?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  session?: {
    id: string;
    status: string;
    duration?: number;
  } | null;
}

export interface CoachingAppointment {
  id: string;
  trainerId: string;
  memberId: string;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  memberNotes?: string | null;
  coachNotes?: string | null;
  location?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trainer?: {
    id: string;
    name: string;
    email: string;
  };
  member?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CalendarWeeklyStats {
  totalScheduled: number;
  completed: number;
  missed: number;
  adherenceRatePct: number;
}

export interface CalendarSummary {
  weekRange: {
    monday: string;
    sunday: string;
  };
  weeklyStats: CalendarWeeklyStats;
  upcomingWorkouts: ScheduledWorkout[];
  restDays: string[];
}

export interface CoachAgendaSummary {
  todayAppointments: CoachingAppointment[];
  upcomingAppointments: CoachingAppointment[];
  pendingFollowUpsCount: number;
}

export interface CreateScheduledWorkoutPayload {
  workoutId: string;
  scheduledAt: string;
  assignmentId?: string;
  notes?: string;
}

export interface CreateCoachScheduledWorkoutPayload {
  memberId: string;
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

export interface CreateAppointmentPayload {
  memberId: string;
  title: string;
  type: AppointmentType;
  startTime: string;
  endTime: string;
  memberNotes?: string;
  coachNotes?: string;
  location?: string;
}

export interface UpdateAppointmentPayload {
  title?: string;
  type?: AppointmentType;
  startTime?: string;
  endTime?: string;
  memberNotes?: string;
  coachNotes?: string;
  location?: string;
  status?: AppointmentStatus;
}

export interface CompleteAppointmentPayload {
  coachNotes?: string;
  memberNotes?: string;
}

export interface CancelAppointmentPayload {
  reason: string;
}
