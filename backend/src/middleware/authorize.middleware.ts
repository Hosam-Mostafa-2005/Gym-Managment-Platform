import type { RequestHandler } from "express";

import type { Permission } from "../constants/permissions.js";
import AppError from "../utils/AppError.js";
import { hasPermission } from "../utils/hasPermission.js";

export const authorize =
  (permission: Permission): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }

    next();
  };
