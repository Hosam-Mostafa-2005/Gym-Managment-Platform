export const Permissions = {
  Dashboard: {
    READ: "dashboard:read",
  },

  Profile: {
    READ: "profile:read",
    UPDATE: "profile:update",
  },

  Exercise: {
    CREATE: "exercise:create",
    READ: "exercise:read",
    UPDATE: "exercise:update",
    DELETE: "exercise:delete",
  },

  Workout: {
    CREATE: "workout:create",
    READ: "workout:read",
    UPDATE: "workout:update",
    DELETE: "workout:delete",
  },

  Assignment: {
    CREATE: "assignment:create",
    READ: "assignment:read",
    UPDATE: "assignment:update",
    DELETE: "assignment:delete",
  },

  Session: {
    READ: "session:read",
    START: "session:start",
    UPDATE: "session:update",
    FINISH: "session:finish",
  },

  Client: {
    READ: "client:read",
    UPDATE: "client:update",
  },
} as const;
type ValueOf<T> = T[keyof T];

type NestedValues<T> = T extends object
  ? ValueOf<{
      [K in keyof T]: NestedValues<T[K]>;
    }>
  : T;

export type Permission = NestedValues<typeof Permissions>;
