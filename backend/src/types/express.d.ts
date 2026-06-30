import type { HydratedDocument } from "mongoose";
import type { IUser, IUserMethods } from "../models/User.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser, IUserMethods>;
    }
  }
}

export {};
