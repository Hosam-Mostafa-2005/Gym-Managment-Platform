import type { ErrorRequestHandler } from "express";
import AppError from "../utils/AppError.js";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const status = err instanceof AppError ? err.status : "error";

  res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error",
  });
};

export default globalErrorHandler;
