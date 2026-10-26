// src/features/member-profile/types/member-profile.types.ts

export interface ProfileReference {
  id: string;
  name: string;
}

export interface WorkoutReference {
  id: string;
  title: string;
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

export interface MemberProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  bio?: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface MemberAssignment {
  id: string;
  workout: WorkoutReference | null;
  trainer: ProfileReference | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
}

export interface MemberMeasurement {
  id: string;
  weight: number | null;
  height: number | null;
  bodyFat: number | null;
  circumferences: CircumferencesData | null;
  notes: string | null;
  measuredAt: string;
  isHistorical?: boolean;
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
  endedAt: string | null;
  duration: number | null;
  totalVolume?: number;
  isHistorical?: boolean;
}

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface CoachingRelationshipInfo {
  id: string;
  trainerId: string;
  memberId: string;
  status: "PENDING" | "ACTIVE" | "DECLINED" | "REVOKED";
  historySharingConsent: "PENDING" | "GRANTED" | "DECLINED" | "REVOKED";
  historyConsentAt?: string | null;
  startedAt?: string | null;
  canAccessHistory: boolean;
  trainer?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PeriodStats {
  totalSessions: number;
  completedSessions: number;
  totalVolume: number;
}

export interface WeightComparison {
  preCoachWeight?: number | null;
  currentWeight?: number | null;
  weightChange?: number | null;
  initialWeight?: number | null;
  latestWeight?: number | null;
  deltaWeight?: number | null;
  direction?: "increase" | "decrease" | "neutral";
}

export interface HistoricalProgress {
  isShared: boolean;
  stats?: PeriodStats | null;
  sessions: MemberSession[];
  measurements: MemberMeasurement[];
}

export interface CurrentCoachProgress {
  stats?: PeriodStats | null;
  weightComparison?: WeightComparison | null;
  sessions: MemberSession[];
  measurements: MemberMeasurement[];
}

export interface MemberProfileResponse {
  member: MemberProfileUser;
  overview: MemberOverview;
  assignmentHistory: MemberAssignment[];
  measurementHistory: MemberMeasurement[];
  recentSessions: MemberSession[];
  timeline: TimelineEvent[];
  coachingRelationship?: CoachingRelationshipInfo | null;
  historicalProgress?: HistoricalProgress | null;
  currentCoachProgress?: CurrentCoachProgress | null;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}
