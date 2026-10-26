export interface ChartPoint {
  date: string;
  value: number;
}

export interface DashboardActivity {
  type: string;
  action: string;
  member: {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
  };
  date: Date;
  metadata: Record<string, unknown>;
}

export interface MemberAttention {
  member: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
  };
  reasons: string[];
  lastWorkout: Date | null;
  completionRate: number;
  latestMeasurement: Date | null;
  daysSinceWorkout: number;
  daysSinceMeasurement: number;
}

export interface UpcomingAssignment {
  id?: string;
  member: {
    id?: string;
    _id?: string;
    name: string;
  };
  workout: {
    id?: string;
    _id?: string;
    title: string;
  };
  endDate: Date;
  daysRemaining: number;
}

export interface DashboardPriority {
  type: string;
  priority: string;
  title: string;
  description: string;
  member: {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
  };
  reasons: string[];
  count: number;
}

export interface QuickActions {
  inactiveMembers: number;
  overdueMeasurements: number;
  assignmentsEndingSoon: number;
}

export interface DashboardOverview {
  activeMembers: number;
  totalMembers: number;
  activeAssignments: number;
  totalAssignments: number;
  workoutsCreated: number;
  completedSessionsToday: number;
  completedSessionsThisWeek: number;
  completedMemberSessions?: number;
  overdueAssignments?: number;
  completionRate: number;
  measurementsThisWeek: number;
  healthScore: number;
  activeCoachingMembers?: number;
  pendingInvitations?: number;
  expiringAssignments?: number;
}

export interface ClientHealthItem {
  id: string;
  name: string;
  email: string;
  relationshipStatus: string;
  historySharingConsent: string;
  lastWorkoutDate: Date | null;
  daysSinceLastWorkout: number | null;
  activityStatus: "ACTIVE" | "INACTIVE_7_DAYS" | "NO_WORKOUTS";
  completedSessionsThisMonth: number;
  latestMeasurement: {
    weight: number | null;
    measuredAt: Date | null;
    isRestricted: boolean;
    restrictionReason?: string;
  };
}

export interface ActionCenterData {
  pendingInvitations: Array<{
    id: string;
    member: { id: string; name: string; email: string };
    invitedAt: Date;
    notes?: string | null;
  }>;
  expiringAssignments: UpcomingAssignment[];
  inactiveClients: Array<{
    id: string;
    name: string;
    email: string;
    daysSinceLastWorkout: number | null;
    lastWorkoutDate: Date | null;
  }>;
}

export interface DashboardCharts {
  sessions: {
    last7Days: ChartPoint[];
    last30Days: ChartPoint[];
  };

  measurements: {
    last30Days: ChartPoint[];
  };

  assignments: {
    last30Days: ChartPoint[];
  };

  completionRateTrend: {
    last30Days: ChartPoint[];
  };

  assignmentStatusDistribution?: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;

  memberActivityRanking?: Array<{
    memberId: string;
    name: string;
    completedSessions: number;
  }>;
}

export interface UpcomingScheduledWorkout {
  id: string;
  member: {
    id: string;
    name: string;
    email?: string;
  };
  workout: {
    id: string;
    title: string;
    category?: string;
    difficulty?: string;
  };
  scheduledAt: Date;
  notes?: string | null;
}

export interface RecentMeasurement {
  member: {
    id?: string;
    _id?: string;
    name: string;
  };

  trainer: {
    id?: string;
    _id?: string;
    name: string;
  } | null;

  weight: number | null;
  bodyFat: number | null;
  measuredAt: Date;
  isRestricted?: boolean;
}

export interface CoachDashboardMapperInput {
  overview: DashboardOverview;
  todaysPriorities: DashboardPriority[];
  charts: DashboardCharts;
  recentActivity: DashboardActivity[];
  membersNeedingAttention: MemberAttention[];
  upcomingAssignments: UpcomingAssignment[];
  upcomingScheduledWorkouts?: UpcomingScheduledWorkout[];
  recentMeasurements: any[];
  quickActions: QuickActions;
  clientHealthOverview?: ClientHealthItem[];
  actionCenter?: ActionCenterData;
}
