import type { User } from "@prisma/client";
import type { ValidatedImageInfo } from "../utils/imageValidator.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      validatedImageInfo?: ValidatedImageInfo;
    }
  }
}

export {};
