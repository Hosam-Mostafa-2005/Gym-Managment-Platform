import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import type { Role } from "../constants/roles.js";
import catchAsync from "../utils/catchAsync.js";
import type { JwtPayload } from "../types/jwt.types.js";

export const protect: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Bearer Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Cookie
  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  // 3. No Token
  if (!token) {
    throw new AppError("You are not logged in.", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  if (!currentUser.isActive) {
    throw new AppError("This user account has been deactivated.", 401);
  }

  // Check if user changed password after the token was issued
  if (currentUser.passwordChangedAt && decoded.iat) {
    const changedTimestamp = Math.floor(
      currentUser.passwordChangedAt.getTime() / 1000,
    );
    if (decoded.iat < changedTimestamp) {
      throw new AppError(
        "User recently changed password. Please log in again.",
        401,
      );
    }
  }

  req.user = currentUser;

  next();
});

export const optionalProtect: RequestHandler = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (currentUser && currentUser.isActive) {
        if (currentUser.passwordChangedAt && decoded.iat) {
          const changedTimestamp = Math.floor(
            currentUser.passwordChangedAt.getTime() / 1000,
          );
          if (decoded.iat < changedTimestamp) {
            return next();
          }
        }
        req.user = currentUser;
      }
    } catch {
      // Ignore token verification errors in optional authentication
    }

    next();
  },
);

export const restrictTo = (...roles: Role[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }

    next();
  };
};

export default protect;
