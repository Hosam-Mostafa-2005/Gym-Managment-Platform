export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: Date;
}

export interface WorkoutStats {
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  totalVolume: number;
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface Charts {
  weight: ChartPoint[];
  bodyFat: ChartPoint[];
  workoutVolume: ChartPoint[];
  workoutDuration: ChartPoint[];
}

export interface KPIs {
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

export interface WorkoutInsights {
  currentStreak: number;
  longestStreak: number;
  lastWorkout: Date | null;
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

export interface MemberInsightsMapperInput {
  kpis: KPIs;
  charts: Charts;
  workoutInsights: WorkoutInsights;
  bodyInsights: BodyInsights;
  timeline: TimelineEvent[];
}
