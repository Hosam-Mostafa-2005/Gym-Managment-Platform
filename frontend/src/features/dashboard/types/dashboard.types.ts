export interface DashboardWorkoutExercise {
  exercise: string;
  sets: number;
  reps: string;
  restSeconds: number;
  order: number;
}

export interface DashboardWorkout {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  tags: string[];
  isTemplate: boolean;
  exercises: DashboardWorkoutExercise[];
  createdBy: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDashboardData {
  overview: MemberDashboardOverview;
  charts: MemberDashboardCharts;
  rankings: Record<string, never>;
  trends: MemberDashboardTrends;
  recentActivity: MemberDashboardActivity[];
}

export interface MemberDashboardResponse {
  status: string;
  data: MemberDashboardData;
}

export interface DashboardAssignment {
  _id: string;
  member: string;
  trainer: string;
  workout: DashboardWorkout;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDashboardOverview {
  activeAssignment: DashboardAssignment | null;
  currentWorkout: DashboardWorkout | null;

  totalSessions: number;
  completedSessions: number;

  currentProgress: number;
  currentStreak: number;
  bestStreak: number;

  exercisesCompleted: number;
  totalSetsCompleted: number;
  totalVolumeLifted: number;
  totalWorkoutMinutes: number;

  averageWorkoutDuration: number;
  averageVolumePerWorkout: number;

  attendanceRate: number;
  completionRate: number;

  workoutsThisWeek: number;
  workoutsThisMonth: number;
}

export interface WorkoutVolumeDaily {
  date: string;
  volume: number;
}

export interface WorkoutVolumeMonthly {
  month: string;
  volume: number;
  _id?: string;
}

export interface SessionDurationPoint {
  date: string;
  duration: number;
}

export interface ExercisesCompletedPerWeek {
  week: string;
  exercises: number;
}

export interface SetsCompletedPerWeek {
  week: string;
  sets: number;
}

export interface WorkoutFrequencyByWeekday {
  day: string;
  sessions: number;
}

export interface WorkoutFrequencyByHour {
  hour: string;
  sessions: number;
}

export interface MemberDashboardCharts {
  workoutVolumeLast30Days: WorkoutVolumeDaily[];
  workoutVolumeLast12Months: WorkoutVolumeMonthly[];

  sessionDurationTrend: SessionDurationPoint[];

  exercisesCompletedPerWeek: ExercisesCompletedPerWeek[];
  setsCompletedPerWeek: SetsCompletedPerWeek[];

  workoutFrequencyByWeekday: WorkoutFrequencyByWeekday[];
  workoutFrequencyByHour: WorkoutFrequencyByHour[];
}

export interface StrongestExercise {
  _id: string;
  name: string;
  val: number;
}

export interface FavoriteWorkout {
  name: string;
  timesCompleted: number;
}

export interface FavoriteExercise {
  _id: string;
  name: string;
  val: number;
}

export interface BestMonth {
  month: string;
  volume: number;
}

export interface MemberDashboardTrends {
  strongestExercise: StrongestExercise | null;
  favoriteWorkout: FavoriteWorkout | null;
  favoriteExercise: FavoriteExercise | null;

  longestWorkout: number;
  shortestWorkout: number;

  bestMonth: BestMonth | null;
}

export interface MemberDashboardActivity {
  id: string;
  message: string;
  date: string;
  type: string;
}

export interface MemberDashboardResponse {
  status: string;

  data: {
    overview: MemberDashboardOverview;
    charts: MemberDashboardCharts;
    rankings: Record<string, never>;
    trends: MemberDashboardTrends;
    recentActivity: MemberDashboardActivity[];
  };
}
