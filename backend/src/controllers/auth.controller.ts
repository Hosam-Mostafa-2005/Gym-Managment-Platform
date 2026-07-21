import type { RequestHandler } from "express";
import authService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import sendToken from "../utils/sendToken.js";

export const register: RequestHandler = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  sendToken({
    token,
    user,
    statusCode: 201,
    res,
  });
});

export const login: RequestHandler = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  sendToken({
    token,
    user,
    statusCode: 200,
    res,
  });
});

export const logout: RequestHandler = catchAsync(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const getMe: RequestHandler = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

export const updatePassword: RequestHandler = catchAsync(async (req, res) => {
  const { user, token } = await authService.updatePassword(req.user!, req.body);

  sendToken({
    token,
    user,
    statusCode: 200,
    res,
  });
});
