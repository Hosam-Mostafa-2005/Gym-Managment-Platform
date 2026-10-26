// src/features/gamification/types/gamification.types.ts

export type AchievementCategory =
  | "WORKOUT"
  | "CONSISTENCY"
  | "NUTRITION"
  | "PROGRESS";

export type AchievementTier =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  badgeIcon: string;
  criteriaType: string;
  criteriaTarget: number;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  progress: number;
  achievement: Achievement;
}

export interface AchievementWithStatus extends Achievement {
  isEarned: boolean;
  earnedAt: string | null;
  currentProgress: number;
  progressPercent: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  isActiveStreak: boolean;
}

export interface WeeklyGoalInfo {
  targetWorkouts: number;
  completedThisWeek: number;
  percent: number;
  weekStartDate: string;
}

export interface GamificationSummary {
  totalPoints: number;
  totalEarned: number;
  totalAvailable: number;
  completionRate: number;
}

export interface GamificationOverview {
  streak: StreakInfo;
  weeklyGoal: WeeklyGoalInfo;
  summary: GamificationSummary;
  achievements: AchievementWithStatus[];
  recentAchievements: UserAchievement[];
}

export interface CoachMemberGamification {
  member: {
    id: string;
    name: string;
    email: string;
  };
  gamification: GamificationOverview;
}

export interface SendEncouragementPayload {
  message: string;
}
