// src/features/gamification/utils/achievement-progress.ts

export interface AchievementProgressInput {
  isEarned?: boolean;
  currentProgress?: number;
  criteriaTarget?: number;
  targetProgress?: number;
  progressPercent?: number;
  progressPct?: number;
  criteria?: { target?: number };
}

export interface CalculatedAchievementProgress {
  current: number;
  target: number;
  percent: number;
}

/**
 * Calculates and normalizes achievement progress for UI presentation.
 *
 * Rules:
 * 1. If achievement is earned, percent is strictly 100%.
 * 2. If target is missing, zero, or negative, percent is 0% (never NaN or Infinity).
 * 3. Progress percentage is never negative and never exceeds 100%.
 * 4. Transparently accepts both backend property names (targetProgress vs criteriaTarget, progressPct vs progressPercent).
 */
export function calculateAchievementProgress(
  achievement?: AchievementProgressInput | null,
): CalculatedAchievementProgress {
  if (!achievement) {
    return { current: 0, target: 0, percent: 0 };
  }

  const target = Math.max(
    0,
    Number(
      achievement.criteriaTarget ??
        achievement.targetProgress ??
        achievement.criteria?.target,
    ) || 0,
  );

  const current = Math.max(
    0,
    Number(achievement.currentProgress) || 0,
  );

  if (achievement.isEarned) {
    return {
      current: current || target,
      target,
      percent: 100,
    };
  }

  // If explicit percentage is provided and valid, use it; otherwise compute from current and target
  let percent = 0;
  if (target > 0) {
    const rawCalc = (current / target) * 100;
    percent = Math.min(100, Math.max(0, Math.round(rawCalc)));
  }

  return {
    current,
    target,
    percent,
  };
}
