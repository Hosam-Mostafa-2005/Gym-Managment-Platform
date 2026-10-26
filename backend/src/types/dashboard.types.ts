export interface TrainerDashboard {
  totalMembers: number;
  totalExercises: number;
  totalWorkouts: number;
  activeAssignments: number;
  activeSessions: number;
  completedSessions: number;
}

export interface LatestMeasurement {
  weight: number;
  unit: string;
  measuredAt: Date;
  diffFromPrevious: number | null;
}

export interface Consistency30Days {
  activeDays: number;
  totalDays: number;
  percentage: number;
}

export interface CoachConnection {
  hasActiveCoach: boolean;
  status: string | null;
  historySharingConsent: string | null;
  coach: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  startedAt: Date | null;
}

export interface NeedsAttention {
  pendingInvitation: {
    id: string;
    trainer: {
      id: string;
      name: string;
      email: string;
    };
    invitedAt: Date;
    notes?: string | null;
  } | null;
  unreadNotificationsCount: number;
}

export interface MemberDashboard {
  activeAssignment: any;
  totalSessions: number;
  completedSessions: number;
  lastWorkout: any;
  recentLogs: any[];
  latestMeasurement?: LatestMeasurement | null;
  consistency30Days?: Consistency30Days;
  coachConnection?: CoachConnection;
  needsAttention?: NeedsAttention;
}
