import { Roles, type Role } from "./roles.js";
import { Permissions, type Permission } from "./permissions.js";

export const RolePermissions: Record<Role, readonly Permission[]> = {
  [Roles.ADMIN]: [],

  [Roles.TRAINER]: [
    // Dashboard
    Permissions.Dashboard.READ,

    // Profile
    Permissions.Profile.READ,
    Permissions.Profile.UPDATE,

    // Exercises (V1)
    Permissions.Exercise.CREATE,
    Permissions.Exercise.READ,
    Permissions.Exercise.UPDATE,
    Permissions.Exercise.DELETE,

    // Workouts
    Permissions.Workout.CREATE,
    Permissions.Workout.READ,
    Permissions.Workout.UPDATE,
    Permissions.Workout.DELETE,

    // Assignments
    Permissions.Assignment.CREATE,
    Permissions.Assignment.READ,
    Permissions.Assignment.UPDATE,
    Permissions.Assignment.DELETE,

    // Sessions
    Permissions.Session.READ,

    // Clients
    Permissions.Client.READ,
    Permissions.Client.UPDATE,
  ],

  [Roles.MEMBER]: [
    // Dashboard
    Permissions.Dashboard.READ,

    // Profile
    Permissions.Profile.READ,
    Permissions.Profile.UPDATE,

    // Exercises
    Permissions.Exercise.READ,

    // Workouts
    Permissions.Workout.READ,

    // Assignments
    Permissions.Assignment.READ,

    // Sessions
    Permissions.Session.READ,
    Permissions.Session.START,
    Permissions.Session.UPDATE,
    Permissions.Session.FINISH,
  ],
} as const;
