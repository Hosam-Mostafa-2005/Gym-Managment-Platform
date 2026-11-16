// src/utils/sendToken.ts
import type { Response } from "express";

interface SendTokenOptions {
  token: string;
  statusCode: number;
  user: unknown;
  res: Response;
  message?: string;
  delivery?: unknown;
}

const sendToken = ({
  token,
  statusCode,
  user,
  res,
  message,
  delivery,
}: SendTokenOptions) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    ...(message ? { message } : {}),
    ...(delivery ? { delivery } : {}),
    data: {
      user,
    },
  });
};

export default sendToken;
