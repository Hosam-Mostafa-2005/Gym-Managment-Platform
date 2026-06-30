import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export default generateToken;
