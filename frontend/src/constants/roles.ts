export const Roles = {
  ADMIN: "admin",
  TRAINER: "trainer",
  MEMBER: "member",
} as const;

export const ROLES = Roles;

export type Role = (typeof Roles)[keyof typeof Roles];
