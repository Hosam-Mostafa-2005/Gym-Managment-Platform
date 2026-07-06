export const Equipment = {
  BARBELL: "Barbell",
  DUMBBELL: "Dumbbell",
  CABLE: "Cable",
  MACHINE: "Machine",
  BODYWEIGHT: "Bodyweight",
  EZ_BAR: "EZ Bar",
  RESISTANCE_BAND: "Resistance Band",
} as const;

export type Equipment = (typeof Equipment)[keyof typeof Equipment];

export const Difficulty = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
