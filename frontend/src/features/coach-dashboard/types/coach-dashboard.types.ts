/* -------------------------------------------------------------------------- */
/*                                Shared Types                               */
/* -------------------------------------------------------------------------- */

export interface DashboardMember {
  id: string;
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
  completionRate: number;
  measurementsThisWeek: number;
  healthScore: number;
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

  recentMeasurements: RecentMeasurement[];

  quickActions: QuickActions;

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
