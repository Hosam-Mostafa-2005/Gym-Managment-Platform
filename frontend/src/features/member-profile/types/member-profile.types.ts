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
}

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface MemberProfileResponse {
  member: MemberProfileUser;
  overview: MemberOverview;
  assignmentHistory: MemberAssignment[];
  measurementHistory: MemberMeasurement[];
  recentSessions: MemberSession[];
  timeline: TimelineEvent[];
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}
