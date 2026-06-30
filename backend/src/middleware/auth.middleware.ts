import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import type { Role } from "../constants/roles.js";
import catchAsync from "../utils/catchAsync.js";
import type { JwtPayload } from "../types/jwt.types.js";

export const protect: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;

  // 1. Bearer Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Cookie
  if (!token && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 3. No Token
  if (!token) {
    throw new AppError("You are not logged in.", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  req.user = currentUser;

  next();
});

export const restrictTo = (...roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }

    next();
  };
};
export default protect;
