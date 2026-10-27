import type { Request, Response, NextFunction, RequestHandler } from "express";
import AppError from "../utils/AppError.js";

const notFound: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export default notFound;
