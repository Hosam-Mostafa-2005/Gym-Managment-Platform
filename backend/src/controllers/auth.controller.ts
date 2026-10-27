// src/controllers/auth.controller.ts
import type { RequestHandler } from "express";
import authService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import sendToken from "../utils/sendToken.js";
import mapUser from "../mappers/user.mapper.js";

export const register: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);

  if (result.isPendingVerification) {
    res.status(201).json({
      status: "success",
      isPendingVerification: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
    return;
  }

  sendToken({
    token: (result as any).token,
    user: {
      ...result.user,
      isPendingRegistration: (result as any).isPendingRegistration || false,
    },
    statusCode: (result as any).isPendingRegistration ? 200 : 201,
    res,
    message: result.message,
    ...("delivery" in result ? { delivery: (result as any).delivery } : {}),
  });
});

export const verifyEmail: RequestHandler = catchAsync(async (req, res) => {
  const { user, token, message } = await authService.verifyEmail(req.body);

  sendToken({
    token,
    user,
    statusCode: 200,
    res,
    message,
  });
});

export const resendVerificationCode: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await authService.resendVerificationCode(req.body);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);

export const login: RequestHandler = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  sendToken({
    token,
    user,
    statusCode: 200,
    res,
  });
});

export const googleAuth: RequestHandler = catchAsync(async (req, res) => {
  const { user, token, linked } = await authService.googleAuth(req.body);

  sendToken({
    token,
    user: {
      ...user,
      linked,
    },
    statusCode: 200,
    res,
  });
});

export const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  res.status(200).json({
    status: "success",
    message: result.message,
    ...(result.resetToken && { resetToken: result.resetToken }),
    ...(result.email && { email: result.email }),
    ...("delivery" in result ? { delivery: (result as any).delivery } : {}),
  });
});

export const verifyResetCode: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.verifyResetCode(req.body);

  res.status(200).json({
    status: "success",
    data: {
      resetToken: result.resetToken,
      email: result.email,
    },
    message: result.message,
  });
});

export const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  res.status(200).json({
    status: "success",
    message: result.message,
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
      user: mapUser(req.user!),
    },
  });
});

export const updatePassword: RequestHandler = catchAsync(async (req, res) => {
  const { user, token, message } = await authService.updatePassword(
    req.user!,
    req.body,
  );

  sendToken({
    token,
    user,
    statusCode: 200,
    res,
    message,
  });
});

export const requestPasswordChangeOtp: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await authService.requestPasswordChangeOtp(req.user!);

    res.status(200).json({
      status: "success",
      message: result.message,
      ...(result.delivery && { delivery: result.delivery }),
    });
  },
);

export const verifyPasswordChangeOtp: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await authService.verifyPasswordChangeOtp(
      req.user!,
      req.body.code,
    );

    res.status(200).json({
      status: "success",
      data: {
        resetToken: result.resetToken,
      },
      message: result.message,
    });
  },
);

export const changePasswordWithCode: RequestHandler = catchAsync(
  async (req, res) => {
    const { user, token, message } = await authService.changePasswordWithCode(
      req.user!,
      req.body,
    );

    sendToken({
      token,
      user,
      statusCode: 200,
      res,
      message,
    });
  },
);

export const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user!.id, req.body);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const completeOnboarding: RequestHandler = catchAsync(async (req, res) => {
  const user = await authService.completeOnboarding(req.user!.id, req.body);

  res.status(200).json({
    status: "success",
    message: "Onboarding completed successfully.",
    data: {
      user,
    },
  });
});
