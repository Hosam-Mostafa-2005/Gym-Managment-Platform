// src/validators/auth.validator.ts
import { z } from "zod";
import { Roles } from "../constants/roles.js";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(50),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8).max(100),
    role: z.enum([Roles.MEMBER]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    code: z.string().trim().length(6, "Verification code must be 6 digits"),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "Google ID token is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
  }),
});

export const verifyResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    code: z.string().trim().length(6, "Verification code must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8).max(100),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(100),
  }),
});

export const verifyPasswordChangeOtpSchema = z.object({
  body: z.object({
    code: z.string().trim().length(6, "Verification code must be 6 digits"),
  }),
});

export const changePasswordWithCodeSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8).max(100),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50).optional(),
    phone: z.string().trim().max(25).optional().nullable(),
    bio: z.string().trim().max(500).optional().nullable(),
    fitnessGoal: z.string().trim().max(100).optional().nullable(),
    experienceLevel: z.string().trim().max(50).optional().nullable(),
    professionalTitle: z.string().trim().max(100).optional().nullable(),
    coachingPhilosophy: z.string().trim().max(1000).optional().nullable(),
    languagesSpoken: z.array(z.string().trim().max(50)).optional(),
    specialties: z.array(z.string().trim().max(50)).optional(),
    certifications: z.array(z.string().trim().max(100)).optional(),
    yearsOfExperience: z.number().int().min(0).max(70).optional(),
  }),
});

export const onboardingSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50).optional(),
    phone: z.string().trim().max(25).optional().nullable(),
    bio: z.string().trim().max(500).optional().nullable(),
    fitnessGoal: z.string().trim().max(100).optional().nullable(),
    experienceLevel: z.string().trim().max(50).optional().nullable(),
    professionalTitle: z.string().trim().max(100).optional().nullable(),
    coachingPhilosophy: z.string().trim().max(1000).optional().nullable(),
    languagesSpoken: z.array(z.string().trim().max(50)).optional(),
    specialties: z.array(z.string().trim().max(50)).optional(),
    certifications: z.array(z.string().trim().max(100)).optional(),
    yearsOfExperience: z.number().int().min(0).max(70).optional(),
    step: z.number().int().min(0).max(5).optional(),
    skipOptional: z.boolean().optional(),
  }),
});
