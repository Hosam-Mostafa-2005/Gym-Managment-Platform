import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodObject } from "zod";

const validate = (schema: ZodObject): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      throw result.error;
    }

    req.body = result.data.body;

    next();
  };
};

export default validate;
