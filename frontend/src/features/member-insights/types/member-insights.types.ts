// src/features/member-insights/types/member-insights.types.ts

export interface ChartPoint {
  date: string;
  value: number;
}

export interface MemberInsightsKPIs {
  currentWeight: number;
  weightDifference: number;
  currentBodyFat: number;
  bodyFatDifference: number;
  completionRate: number;
  totalSessions: number;
  completedSessions: number;
  averageWorkoutDuration: number;
  totalWorkoutVolume: number;
}

export interface MemberInsightsCharts {
  weight: ChartPoint[];
  bodyFat: ChartPoint[];
  workoutVolume: ChartPoint[];
  workoutDuration: ChartPoint[];
}

export interface WorkoutInsights {
  currentStreak: number;
  longestStreak: number;
  lastWorkout: string | null;
  averageRestDays: number;
  workoutFrequency: number;
  attendancePercentage: number;
}

export interface BodyInsights {
  weight: number;
  bodyFat: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  neck: number;
  arms: number;
  thighs: number;
  calves: number;
}

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface AIInsights {
  summary: null;
  recommendations: [];
}

export interface MemberInsightsResponse {
  kpis: MemberInsightsKPIs;
  charts: MemberInsightsCharts;
  workoutInsights: WorkoutInsights;
  bodyInsights: BodyInsights;
  timeline: TimelineEvent[];
  ai: AIInsights;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}
