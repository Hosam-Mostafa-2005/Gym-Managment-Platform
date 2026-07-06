export const Difficulty = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const Category = {
  STRENGTH: "strength",
  HYPERTROPHY: "hypertrophy",
  CARDIO: "cardio",
  MOBILITY: "mobility",
} as const;

export type Category = (typeof Category)[keyof typeof Category];
