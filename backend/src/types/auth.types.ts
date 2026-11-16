// src/types/auth.types.ts
import type { Role } from "../constants/roles.js";

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface GoogleAuthDto {
  idToken: string;
  intendedRole?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  resetToken?: string;
  token?: string;
  newPassword: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordWithCodeDto {
  resetToken: string;
  newPassword: string;
}
