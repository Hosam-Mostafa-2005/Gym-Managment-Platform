import mongoose from "mongoose";

export interface ChartPoint {
  date: string;
  value: number;
}

export interface DashboardActivity {
  type: string;
  action: string;
  member: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email?: string;
  };
  date: Date;
  metadata: Record<string, unknown>;
}

export interface MemberAttention {
  member: {
    _id: mongoose.Types.ObjectId;
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
  member: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
  workout: {
    _id: mongoose.Types.ObjectId;
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
    _id: mongoose.Types.ObjectId;
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
  completionRate: number;
  measurementsThisWeek: number;
  healthScore: number;
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
}

export interface RecentMeasurement {
  member: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };

  trainer: {
    _id: mongoose.Types.ObjectId;
    name: string;
  } | null;

  weight: number | null;
  bodyFat: number | null;
  measuredAt: Date;
}

export interface CoachDashboardMapperInput {
  overview: DashboardOverview;
  todaysPriorities: DashboardPriority[];
  charts: DashboardCharts;
  recentActivity: DashboardActivity[];
  membersNeedingAttention: MemberAttention[];
  upcomingAssignments: UpcomingAssignment[];
  recentMeasurements: any[];
  quickActions: QuickActions;
}
