// src/routes/auth.routes.ts
import { Router, type Request, type Response } from "express";
import validate from "../middleware/validate.middleware.js";

import {
  register,
  registerCoach,
  verifyEmail,
  resendVerificationCode,
  login,
  googleAuth,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  logout,
  getMe,
  updatePassword,
  requestPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePasswordWithCode,
  updateProfile,
  completeOnboarding,
} from "../controllers/auth.controller.js";

import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  verifyPasswordChangeOtpSchema,
  changePasswordWithCodeSchema,
  updateProfileSchema,
  onboardingSchema,
} from "../validators/auth.validator.js";

import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";
import {
  forgotPasswordLimiter,
  verifyResetCodeLimiter,
  resetPasswordLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = Router();

// ================= Public Routes =================
router.post("/register", validate(registerSchema), register);
router.post("/register-coach", validate(registerSchema), registerCoach);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  resendVerificationCode,
);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleAuthSchema), googleAuth);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/verify-reset-code",
  verifyResetCodeLimiter,
  validate(verifyResetCodeSchema),
  verifyResetCode,
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);
router.post("/logout", logout);

// ================= Protected Routes =================
router.get("/me", protect, getMe);
router.patch("/me", protect, validate(updateProfileSchema), updateProfile);
router.patch(
  "/update-profile",
  protect,
  validate(updateProfileSchema),
  updateProfile,
);
router.post(
  "/onboarding",
  protect,
  validate(onboardingSchema),
  completeOnboarding,
);

// Method A: Change password using current password
router.patch(
  "/update-password",
  protect,
  validate(updatePasswordSchema),
  updatePassword,
);

// Method B: Change password using email verification code
router.post("/change-password/request-code", protect, requestPasswordChangeOtp);
router.post(
  "/change-password/verify-code",
  protect,
  validate(verifyPasswordChangeOtpSchema),
  verifyPasswordChangeOtp,
);
router.post(
  "/change-password/confirm",
  protect,
  validate(changePasswordWithCodeSchema),
  changePasswordWithCode,
);

// Admin testing route
router.get("/admin", protect, restrictTo(Roles.ADMIN), (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome Admin",
  });
});

export default router;
