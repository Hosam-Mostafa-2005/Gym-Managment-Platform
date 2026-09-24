// src/features/profile/types/profile.types.ts

// ─── SHARED BASE TYPES ─────────────────────────────────────────────────────

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface ProfileReference {
  id: string;
  name: string;
}

export interface WorkoutReference {
  id: string;
  title: string;
}

export interface ChartPoint {
  date: string;
  value: number;
}

// ─── MEMBER PROFILE TYPES ──────────────────────────────────────────────────

export interface MemberAssignment {
  id: string;
  workout: WorkoutReference | null;
  trainer: ProfileReference | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
}

export interface CircumferencesData {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  neck?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  [key: string]: number | undefined;
}

export interface MemberMeasurement {
  id: string;
  weight: number | null;
  height: number | null;
  bodyFat: number | null;
  circumferences?: CircumferencesData | null;
  notes?: string | null;
  measuredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberWorkoutStats {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageWorkoutDuration: number;
  totalWorkoutVolume: number;
}

export interface MemberOverview {
  currentAssignment: MemberAssignment | null;
  latestMeasurement: MemberMeasurement | null;
  workoutStats: MemberWorkoutStats;
}

export interface MemberSession {
  id: string;
  workout: WorkoutReference | null;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  duration?: number | null;
}

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface MemberProfileResponse {
  member: ProfileUser;
  overview: MemberOverview;
  assignmentHistory: MemberAssignment[];
  measurementHistory: MemberMeasurement[];
  recentSessions: MemberSession[];
  timeline: TimelineEvent[];
}

// ─── COACH PROFILE TYPES ───────────────────────────────────────────────────

export interface CoachProfileDetails {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  specialties: string[];
  certifications: string[];
  yearsOfExperience: number;
  joinedAt: string;
}

export interface CoachOverviewStats {
  activeMembers: number;
  activeAssignments: number;
  workoutsCreated: number;
  completedSessions: number;
  completionRate: number;
  measurementsReviewed: number;
}

export interface CoachMemberStats {
  active: number;
  inactive: number;
  newThisMonth: number;
  completedPrograms: number;
}

export interface MostAssignedWorkout {
  id: string;
  title: string;
  count: number;
}

export interface CoachWorkoutStats {
  totalCreated: number;
  published: number;
  draft: number;
  archived: number;
  mostAssignedWorkout: MostAssignedWorkout | null;
}

export interface CoachCharts {
  sessionsLast30Days: ChartPoint[];
  membersGrowth: ChartPoint[];
  completionRateTrend: ChartPoint[];
}

export interface CoachActivity {
  type: string;
  member: ProfileReference | null;
  date: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface CoachAchievement {
  title: string;
  description: string;
  earned: boolean | string;
}

export interface CoachTask {
  type: string;
  title: string;
  priority: string;
  description: string;
  dueDate?: string | null;
  member: ProfileReference | null;
}

export interface CoachAiSummary {
  summary: string | null;
}

export interface CoachProfileResponse {
  profile: CoachProfileDetails;
  overview: CoachOverviewStats;
  memberStats: CoachMemberStats;
  workoutStats: CoachWorkoutStats;
  charts: CoachCharts;
  recentActivity: CoachActivity[];
  achievements: CoachAchievement[];
  upcomingTasks: CoachTask[];
  ai: CoachAiSummary;
}
