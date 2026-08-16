export const Equipment = {
  BARBELL: "Barbell",
  DUMBBELL: "Dumbbell",
  CABLE: "Cable",
  MACHINE: "Machine",
  SMITH_MACHINE: "Smith Machine",
  BODYWEIGHT: "Bodyweight",
  EZ_BAR: "EZ Bar",
  RESISTANCE_BAND: "Resistance Band",
  KETTLEBELL: "Kettlebell",
} as const;

export type Equipment = (typeof Equipment)[keyof typeof Equipment];

export const Difficulty = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
