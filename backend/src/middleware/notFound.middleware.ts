import type { RequestHandler } from "express";
import AppError from "../utils/AppError.js";

const notFound: RequestHandler = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export default notFound;
