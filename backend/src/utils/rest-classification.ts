export const LARGE_MUSCLE_GROUPS = new Set([
  "chest",
  "back",
  "lats",
  "latissimus",
  "quadriceps",
  "quads",
  "hamstrings",
  "glutes",
  "legs",
]);

export function isLargeMuscleGroup(muscles: string[] = []): boolean {
  return muscles.some((m) =>
    LARGE_MUSCLE_GROUPS.has(m.trim().toLowerCase()),
  );
}

export function getRecommendedRestSeconds(
  primaryMuscles: string[] = [],
  defaultLarge = 90,
  defaultSmall = 60,
): number {
  return isLargeMuscleGroup(primaryMuscles) ? defaultLarge : defaultSmall;
}
