// src/features/auth/types/auth.types.ts
import type { Role } from "@/constants/roles";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified?: boolean;
  hasPassword?: boolean;
  googleLinked?: boolean;
  phone?: string | null;
  bio?: string | null;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  requiresVerification?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  fitnessGoal?: string | null;
  experienceLevel?: string | null;
  professionalTitle?: string | null;
  coachingPhilosophy?: string | null;
  languagesSpoken?: string[];
}

export interface OnboardingRequest {
  role?: string;
  name?: string;
  phone?: string | null;
  bio?: string | null;
  fitnessGoal?: string | null;
  experienceLevel?: string | null;
  professionalTitle?: string | null;
  coachingPhilosophy?: string | null;
  languagesSpoken?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  step?: number;
  skipOptional?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface EmailDeliveryInfo {
  provider: "smtp" | "resend" | "console";
  accepted: boolean;
  messageId?: string;
  errorCategory?: string;
  errorMessage?: string;
  notice?: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  message?: string;
  delivery?: EmailDeliveryInfo;
  data: {
    user: User & { isPendingRegistration?: boolean };
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordWithCodeRequest {
  resetToken: string;
  newPassword: string;
}
