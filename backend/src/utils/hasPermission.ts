import { Roles, type Role } from "../constants/roles.js";
import { RolePermissions } from "../constants/role-permissions.js";
import type { Permission } from "../constants/permissions.js";

export const hasPermission = (role: Role, permission: Permission): boolean => {
  // Admin can do everything
  if (role === Roles.ADMIN) {
    return true;
  }

  const permissions = RolePermissions[role];

  if (!permissions) {
    return false;
  }

  return permissions.includes(permission);
};
