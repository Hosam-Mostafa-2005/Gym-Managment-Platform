import type { Response } from "express";

interface SendTokenOptions {
  token: string;
  statusCode: number;
  user: unknown;
  res: Response;
}

const sendToken = ({ token, statusCode, user, res }: SendTokenOptions) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export default sendToken;
