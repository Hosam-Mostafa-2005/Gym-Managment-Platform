export const DIFFICULTY_OPTIONS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Smith Machine",
  "EZ Bar",
  "Resistance Band",
  "Bodyweight",
  "Kettlebell",
] as const;

export const MUSCLE_OPTIONS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
] as const;

export const ALL_MUSCLE_CATEGORIES = [
  ...MUSCLE_OPTIONS,
  "Core",
  "Lats",
  "Obliques",
  "Traps",
] as const;

export function doesExerciseMatchMuscle(
  exercise: { primaryMuscles?: string[]; secondaryMuscles?: string[] },
  targetCategory?: string | null,
): boolean {
  if (!targetCategory || targetCategory.toLowerCase() === "all") return true;
  const target = targetCategory.toLowerCase().trim();
  const allMuscles = [
    ...(exercise.primaryMuscles ?? []),
    ...(exercise.secondaryMuscles ?? []),
  ].map((m) => m.toLowerCase().trim());

  if (allMuscles.includes(target)) return true;

  if (target === "legs") {
    return allMuscles.some((m) =>
      ["quadriceps", "hamstrings", "glutes", "calves", "legs"].includes(m),
    );
  }
  if (target === "core" || target === "abs") {
    return allMuscles.some((m) =>
      ["core", "abs", "abdominals", "obliques"].includes(m),
    );
  }
  if (target === "back") {
    return allMuscles.some((m) =>
      ["back", "lats", "erector spinae", "traps", "rhomboids"].includes(m),
    );
  }
  if (target === "arms") {
    return allMuscles.some((m) =>
      ["biceps", "triceps", "forearms", "brachialis", "brachioradialis"].includes(m),
    );
  }

  return false;
}
