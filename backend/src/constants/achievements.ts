// src/constants/achievements.ts

export const ACHIEVEMENT_CATEGORY = {
  WORKOUT: "WORKOUT",
  CONSISTENCY: "CONSISTENCY",
  NUTRITION: "NUTRITION",
  PROGRESS: "PROGRESS",
} as const;

export type AchievementCategory =
  (typeof ACHIEVEMENT_CATEGORY)[keyof typeof ACHIEVEMENT_CATEGORY];

export const ACHIEVEMENT_TIER = {
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  DIAMOND: "DIAMOND",
} as const;

export type AchievementTier =
  (typeof ACHIEVEMENT_TIER)[keyof typeof ACHIEVEMENT_TIER];

export interface SystemAchievementDefinition {
  code: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  badgeIcon: string;
  points: number;
  displayOrder: number;
  criteria: {
    type:
      | "COMPLETED_WORKOUTS"
      | "WORKOUT_STREAK"
      | "WEEKLY_WORKOUTS"
      | "COMEBACK"
      | "NUTRITION_DAYS"
      | "NUTRITION_WEEKLY"
      | "BODY_MEASUREMENTS";
    target: number;
  };
}

export const SYSTEM_ACHIEVEMENTS: SystemAchievementDefinition[] = [
  // ==========================================
  // WORKOUT MILESTONES
  // ==========================================
  {
    code: "FIRST_WORKOUT",
    title: "First Sweat",
    description: "Completed your very first workout session on STREN",
    category: "WORKOUT",
    tier: "BRONZE",
    badgeIcon: "dumbbell",
    points: 10,
    displayOrder: 1,
    criteria: { type: "COMPLETED_WORKOUTS", target: 1 },
  },
  {
    code: "WORKOUTS_5",
    title: "High Five",
    description: "Completed 5 workout sessions",
    category: "WORKOUT",
    tier: "BRONZE",
    badgeIcon: "target",
    points: 25,
    displayOrder: 2,
    criteria: { type: "COMPLETED_WORKOUTS", target: 5 },
  },
  {
    code: "WORKOUTS_10",
    title: "Double Digits",
    description: "Completed 10 workout sessions",
    category: "WORKOUT",
    tier: "SILVER",
    badgeIcon: "award",
    points: 50,
    displayOrder: 3,
    criteria: { type: "COMPLETED_WORKOUTS", target: 10 },
  },
  {
    code: "WORKOUTS_25",
    title: "Quarter Century",
    description: "Completed 25 workout sessions",
    category: "WORKOUT",
    tier: "GOLD",
    badgeIcon: "trophy",
    points: 100,
    displayOrder: 4,
    criteria: { type: "COMPLETED_WORKOUTS", target: 25 },
  },
  {
    code: "WORKOUTS_50",
    title: "Iron Warrior",
    description: "Completed 50 workout sessions",
    category: "WORKOUT",
    tier: "PLATINUM",
    badgeIcon: "flame",
    points: 200,
    displayOrder: 5,
    criteria: { type: "COMPLETED_WORKOUTS", target: 50 },
  },
  {
    code: "WORKOUTS_100",
    title: "Century Club",
    description: "Completed 100 workout sessions",
    category: "WORKOUT",
    tier: "DIAMOND",
    badgeIcon: "zap",
    points: 500,
    displayOrder: 6,
    criteria: { type: "COMPLETED_WORKOUTS", target: 100 },
  },

  // ==========================================
  // CONSISTENCY & STREAKS
  // ==========================================
  {
    code: "WEEKLY_GOAL_MET",
    title: "Week Crusher",
    description: "Hit your weekly training goal by completing 3+ workouts in a week",
    category: "CONSISTENCY",
    tier: "BRONZE",
    badgeIcon: "calendar-check",
    points: 30,
    displayOrder: 10,
    criteria: { type: "WEEKLY_WORKOUTS", target: 3 },
  },
  {
    code: "STREAK_3",
    title: "Building Momentum",
    description: "Maintained a 3-day active training streak",
    category: "CONSISTENCY",
    tier: "BRONZE",
    badgeIcon: "flame",
    points: 20,
    displayOrder: 11,
    criteria: { type: "WORKOUT_STREAK", target: 3 },
  },
  {
    code: "STREAK_7",
    title: "Unstoppable Force",
    description: "Maintained a 7-day active training streak",
    category: "CONSISTENCY",
    tier: "SILVER",
    badgeIcon: "flame",
    points: 50,
    displayOrder: 12,
    criteria: { type: "WORKOUT_STREAK", target: 7 },
  },
  {
    code: "STREAK_14",
    title: "Two-Week Legend",
    description: "Maintained a 14-day active training streak",
    category: "CONSISTENCY",
    tier: "GOLD",
    badgeIcon: "flame",
    points: 100,
    displayOrder: 13,
    criteria: { type: "WORKOUT_STREAK", target: 14 },
  },
  {
    code: "STREAK_30",
    title: "Monthly Mastery",
    description: "Maintained a 30-day active training streak",
    category: "CONSISTENCY",
    tier: "DIAMOND",
    badgeIcon: "zap",
    points: 250,
    displayOrder: 14,
    criteria: { type: "WORKOUT_STREAK", target: 30 },
  },
  {
    code: "COMEBACK_CHAMPION",
    title: "The Comeback",
    description: "Completed a workout session after 14 or more days away",
    category: "CONSISTENCY",
    tier: "SILVER",
    badgeIcon: "rotate-ccw",
    points: 40,
    displayOrder: 15,
    criteria: { type: "COMEBACK", target: 14 },
  },

  // ==========================================
  // NUTRITION MILESTONES
  // ==========================================
  {
    code: "FIRST_FOOD_LOG",
    title: "Mindful Fuel",
    description: "Logged your first food item in STREN Nutrition",
    category: "NUTRITION",
    tier: "BRONZE",
    badgeIcon: "apple",
    points: 10,
    displayOrder: 20,
    criteria: { type: "NUTRITION_DAYS", target: 1 },
  },
  {
    code: "NUTRITION_STREAK_7",
    title: "Fuel Consistency",
    description: "Logged nutrition entries across 7 distinct days",
    category: "NUTRITION",
    tier: "SILVER",
    badgeIcon: "utensils",
    points: 50,
    displayOrder: 21,
    criteria: { type: "NUTRITION_DAYS", target: 7 },
  },
  {
    code: "NUTRITION_WEEKLY_TRACKER",
    title: "Macro Maestro",
    description: "Logged nutrition on 5 or more days in a single calendar week",
    category: "NUTRITION",
    tier: "GOLD",
    badgeIcon: "pie-chart",
    points: 75,
    displayOrder: 22,
    criteria: { type: "NUTRITION_WEEKLY", target: 5 },
  },

  // ==========================================
  // PROGRESS MILESTONES
  // ==========================================
  {
    code: "FIRST_MEASUREMENT",
    title: "Benchmark Set",
    description: "Recorded your baseline body measurements",
    category: "PROGRESS",
    tier: "BRONZE",
    badgeIcon: "scale",
    points: 10,
    displayOrder: 30,
    criteria: { type: "BODY_MEASUREMENTS", target: 1 },
  },
  {
    code: "PROGRESS_TRACKER",
    title: "Consistent Tracking",
    description: "Recorded 3 or more progress body measurement entries",
    category: "PROGRESS",
    tier: "SILVER",
    badgeIcon: "trending-up",
    points: 40,
    displayOrder: 31,
    criteria: { type: "BODY_MEASUREMENTS", target: 3 },
  },
];
