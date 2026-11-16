import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import AppError from "../utils/AppError.js";

const globalErrorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  // AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.data !== undefined ? { data: err.data } : {}),
    });
  }

  // Zod Validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Prisma Unique Constraint
  if (err.code === "P2002") {
    return res.status(409).json({
      status: "fail",
      message: "A record with this unique value already exists.",
    });
  }

  // Prisma Record Not Found
  if (err.code === "P2025") {
    return res.status(404).json({
      status: "fail",
      message: "The requested resource was not found.",
    });
  }

  // Prisma Foreign Key Constraint
  if (err.code === "P2003") {
    return res.status(400).json({
      status: "fail",
      message: "Referenced related record does not exist or cannot be modified.",
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Your session token has expired. Please log in again.",
    });
  }

  // Unknown Error
  console.error(err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong.",
  });
};

export default globalErrorHandler;
