/* -------------------------------------------------------------------------- */
/*                                Shared Types                               */
/* -------------------------------------------------------------------------- */

export interface DashboardMember {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
}

export interface DashboardChartPoint {
  date: string;
  value: number;
}

/* -------------------------------------------------------------------------- */
/*                             Overview Types                                */
/* -------------------------------------------------------------------------- */

export interface DashboardOverview {
  members: {
    active: number;
    total: number;
  };

  assignments: {
    active: number;
    total: number;
  };

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

/* -------------------------------------------------------------------------- */
/*                           Today's Priorities                               */
/* -------------------------------------------------------------------------- */

export interface DashboardPriority {
  type: string;
  priority: string;
  title: string;
  description: string;

  member: DashboardMember;

  reasons: string[];
  count: number;
}

/* -------------------------------------------------------------------------- */
/*                            Recent Activity                                */
/* -------------------------------------------------------------------------- */

export type DashboardActivityType =
  "WORKOUT" | "ASSIGNMENT" | "BODY_MEASUREMENT";

export type DashboardActivityAction =
  "STARTED" | "COMPLETED" | "CREATED" | "RECORDED";

export interface DashboardActivityMetadata {
  workoutTitle?: string;
  duration?: number;
  volume?: number;
  weight?: number | null;
  bodyFat?: number | null;
}

export interface DashboardActivity {
  id: string;

  type: DashboardActivityType;

  member: DashboardMember | null;

  date: string;

  action: DashboardActivityAction;

  metadata: DashboardActivityMetadata;
}

/* -------------------------------------------------------------------------- */
/*                       Members Needing Attention                            */
/* -------------------------------------------------------------------------- */

export interface MemberNeedingAttention {
  member: DashboardMember;

  reasons: string[];

  lastWorkout: string | null;

  completionRate: number;

  latestMeasurement: string | null;
}

/* -------------------------------------------------------------------------- */
/*                          Upcoming Assignments                              */
/* -------------------------------------------------------------------------- */

export interface UpcomingAssignment {
  id: string;

  member: {
    id: string;
    name: string;
    email?: string;
  } | null;

  workout: {
    id: string;
    title: string;
  } | null;

  endDate: string;

  daysRemaining: number;
}

/* -------------------------------------------------------------------------- */
/*                          Recent Measurements                               */
/* -------------------------------------------------------------------------- */

export interface RecentMeasurement {
  id?: string;
  member: {
    id: string;
    name: string;
  } | null;

  trainer: {
    id: string;
    name: string;
  } | null;

  weight: number | null;

  bodyFat: number | null;

  measuredAt: string;
  isRestricted?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             Client Health                                  */
/* -------------------------------------------------------------------------- */

export interface ClientHealthItem {
  id: string;
  name: string;
  email: string;
  relationshipStatus: string;
  historySharingConsent: string;
  lastWorkoutDate: string | null;
  daysSinceLastWorkout: number | null;
  activityStatus: "ACTIVE" | "INACTIVE_7_DAYS" | "NO_WORKOUTS";
  completedSessionsThisMonth: number;
  latestMeasurement: {
    weight: number | null;
    measuredAt: string | null;
    isRestricted: boolean;
    restrictionReason?: string;
  };
}

/* -------------------------------------------------------------------------- */
/*                             Action Center                                  */
/* -------------------------------------------------------------------------- */

export interface ActionCenterData {
  pendingInvitations: Array<{
    id: string;
    member: { id: string; name: string; email: string };
    invitedAt: string;
    notes?: string | null;
  }>;
  expiringAssignments: UpcomingAssignment[];
  inactiveClients: Array<{
    id: string;
    name: string;
    email: string;
    daysSinceLastWorkout: number | null;
    lastWorkoutDate: string | null;
  }>;
}

/* -------------------------------------------------------------------------- */
/*                             Quick Actions                                 */
/* -------------------------------------------------------------------------- */

export interface DashboardQuickActions {
  inactiveMembers: number;

  overdueMeasurements: number;

  assignmentsEndingSoon: number;
}

/* -------------------------------------------------------------------------- */
/*                               Charts Types                                 */
/* -------------------------------------------------------------------------- */

export interface AssignmentStatusPoint {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MemberActivityRankingPoint {
  memberId: string;
  name: string;
  completedSessions: number;
}

export interface DashboardCharts {
  sessions: {
    last7Days: DashboardChartPoint[];
    last30Days: DashboardChartPoint[];
  };

  measurements: {
    last30Days: DashboardChartPoint[];
  };

  assignments: {
    last30Days: DashboardChartPoint[];
  };

  completionRate: {
    last30Days: DashboardChartPoint[];
  };

  assignmentStatusDistribution?: AssignmentStatusPoint[];
  memberActivityRanking?: MemberActivityRankingPoint[];
}

export interface UpcomingScheduledWorkout {
  id: string;
  member: {
    id: string;
    name: string;
    email?: string;
  } | null;
  workout: {
    id: string;
    title: string;
    category?: string;
    difficulty?: string;
  } | null;
  scheduledAt: string;
  notes?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                                  AI                                        */
/* -------------------------------------------------------------------------- */

export interface DashboardAI {
  enabled: boolean;

  summary: string | null;
}

/* -------------------------------------------------------------------------- */
/*                             Quick Actions                                 */
/* -------------------------------------------------------------------------- */

export interface QuickActions {
  inactiveMembers: number;
  overdueMeasurements: number;
  assignmentsEndingSoon: number;
}

/* -------------------------------------------------------------------------- */
/*                           Coach Dashboard                                  */
/* -------------------------------------------------------------------------- */

export interface CoachDashboard {
  generatedAt: string;

  overview: DashboardOverview;

  todaysPriorities: DashboardPriority[];

  charts: DashboardCharts;

  recentActivity: DashboardActivity[];

  membersNeedingAttention: MemberAttention[];

  upcomingAssignments: UpcomingAssignment[];

  upcomingScheduledWorkouts?: UpcomingScheduledWorkout[];

  recentMeasurements: RecentMeasurement[];

  quickActions: QuickActions;

  clientHealthOverview?: ClientHealthItem[];

  actionCenter?: ActionCenterData;

  ai: DashboardAI;
}

/* -------------------------------------------------------------------------- */
/*                       Members Needing Attention                            */
/* -------------------------------------------------------------------------- */

export interface MemberAttention {
  member: {
    id: string;
    _id?: string;
    name: string;
    email: string;
  };

  reasons: string[];

  lastWorkout: string | null;

  completionRate: number;

  latestMeasurement: string | null;

  daysSinceWorkout: number;

  daysSinceMeasurement: number;
}
