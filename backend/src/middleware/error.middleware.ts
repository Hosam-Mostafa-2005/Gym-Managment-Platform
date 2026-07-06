import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import AppError from "../utils/AppError.js";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
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

  // Mongo Duplicate Key
  if (err.code === 11000) {
    return res.status(409).json({
      status: "fail",
      message: "Duplicate field value.",
    });
  }

  // Mongo Validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }

  // Mongo Cast Error
  if (err.name === "CastError") {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format.",
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
