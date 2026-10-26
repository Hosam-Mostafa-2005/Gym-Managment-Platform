export interface DashboardWorkoutExercise {
  exercise: string;
  sets: number;
  reps: string;
  restSeconds: number;
  order: number;
}

export interface DashboardWorkout {
  _id: string;
  id?: string;
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
  __v?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionStatusPoint {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface UpcomingScheduledWorkout {
  id: string;
  workoutId: string;
  scheduledAt: string;
  notes?: string | null;
  workout?: {
    id: string;
    title: string;
    difficulty?: string;
    category?: string;
    estimatedDuration?: number;
  };
}

export interface LatestMeasurement {
  weight: number;
  unit: string;
  measuredAt: string;
  diffFromPrevious: number | null;
}

export interface Consistency30Days {
  activeDays: number;
  totalDays: number;
  percentage: number;
}

export interface CoachConnection {
  hasActiveCoach: boolean;
  status: string | null;
  historySharingConsent: string | null;
  coach: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  startedAt: string | null;
}

export interface NeedsAttention {
  pendingInvitation: {
    id: string;
    trainer: {
      id: string;
      name: string;
      email: string;
    };
    invitedAt: string;
    notes?: string | null;
  } | null;
  unreadNotificationsCount: number;
}

export interface DailyNutritionSnapshot {
  hasActivePlan: boolean;
  onboardingCompleted: boolean;
  planName?: string | null;
  planSource?: string | null;
  coachName?: string | null;
  targetCalories: number;
  loggedCalories: number;
  remainingCalories: number;
  calorieProgressPct: number;
  targetProteinG: number;
  loggedProteinG: number;
  proteinProgressPct: number;
  targetCarbsG: number;
  loggedCarbsG: number;
  carbsProgressPct: number;
  targetFatG: number;
  loggedFatG: number;
  fatProgressPct: number;
  logsCount: number;
}

export interface MemberDashboardData {
  overview: MemberDashboardOverview;
  charts: MemberDashboardCharts;
  upcomingWorkouts?: UpcomingScheduledWorkout[];
  rankings: Record<string, never>;
  trends: MemberDashboardTrends;
  recentActivity: MemberDashboardActivity[];
  latestMeasurement?: LatestMeasurement | null;
  consistency30Days?: Consistency30Days;
  coachConnection?: CoachConnection;
  needsAttention?: NeedsAttention;
  nutritionSnapshot?: DailyNutritionSnapshot | null;
}

export interface MemberDashboardResponse {
  status: string;
  data: MemberDashboardData;
}

export interface DashboardAssignment {
  _id: string;
  id?: string;
  member: string;
  trainer: string;
  workout: DashboardWorkout;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  isActive: boolean;
  __v?: number;
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

  latestMeasurement?: LatestMeasurement | null;
  consistency30Days?: Consistency30Days;
  coachConnection?: CoachConnection;
  needsAttention?: NeedsAttention;
  nutritionSnapshot?: DailyNutritionSnapshot | null;
  upcomingWorkouts?: UpcomingScheduledWorkout[];
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
  sessionStatusDistribution?: SessionStatusPoint[];
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
