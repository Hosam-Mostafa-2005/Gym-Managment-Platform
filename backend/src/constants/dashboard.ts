export const PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const ACTIVITY_TYPE = {
  WORKOUT: "WORKOUT",
  ASSIGNMENT: "ASSIGNMENT",
  BODY_MEASUREMENT: "BODY_MEASUREMENT",
} as const;

export const ACTIVITY_ACTION = {
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  CREATED: "CREATED",
  RECORDED: "RECORDED",
} as const;
