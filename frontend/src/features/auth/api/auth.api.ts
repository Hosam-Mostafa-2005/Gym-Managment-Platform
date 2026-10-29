// src/features/auth/api/auth.api.ts
import axios from "axios";
import { api } from "@/lib/axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  GoogleAuthRequest,
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  ChangePasswordWithCodeRequest,
  EmailDeliveryInfo,
  OnboardingRequest,
  User,
} from "../types/auth.types";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data;
};

export const registerCoach = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register-coach", data);
  return response.data;
};

export const verifyEmail = async (
  data: VerifyEmailRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/verify-email", data);
  return response.data;
};

export const resendVerification = async (
  data: ResendVerificationRequest,
): Promise<{ message: string; delivery?: EmailDeliveryInfo }> => {
  const response = await api.post<{
    message: string;
    delivery?: EmailDeliveryInfo;
  }>("/auth/resend-verification", data);
  return response.data;
};

export const googleAuth = async (
  data: GoogleAuthRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/google", data);
  return response.data;
};

export const forgotPassword = async (
  data: ForgotPasswordRequest,
): Promise<{
  message: string;
  delivery?: EmailDeliveryInfo;
}> => {
  const response = await api.post<{
    message: string;
    delivery?: EmailDeliveryInfo;
  }>("/auth/forgot-password", data);
  return response.data;
};

export const verifyResetCode = async (
  data: VerifyResetCodeRequest,
): Promise<{ data: { resetToken: string; email: string }; message: string }> => {
  const response = await api.post<{
    data: { resetToken: string; email: string };
    message: string;
  }>("/auth/verify-reset-code", data);
  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    "/auth/reset-password",
    data,
  );
  return response.data;
};

export const updatePassword = async (
  data: UpdatePasswordRequest,
): Promise<LoginResponse> => {
  const response = await api.patch<LoginResponse>(
    "/auth/update-password",
    data,
  );
  return response.data;
};

export const requestPasswordChangeOtp = async (): Promise<{
  message: string;
  delivery?: EmailDeliveryInfo;
}> => {
  const response = await api.post<{
    message: string;
    delivery?: EmailDeliveryInfo;
  }>("/auth/change-password/request-code");
  return response.data;
};

export const verifyPasswordChangeOtp = async (data: {
  code: string;
}): Promise<{ data: { resetToken: string }; message: string }> => {
  const response = await api.post<{
    data: { resetToken: string };
    message: string;
  }>("/auth/change-password/verify-code", data);
  return response.data;
};

export const changePasswordWithCode = async (
  data: ChangePasswordWithCodeRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/change-password/confirm",
    data,
  );
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/auth/me");
    return data.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const completeOnboarding = async (
  payload: OnboardingRequest,
): Promise<{ status: string; message: string; data: { user: User } }> => {
  const { data } = await api.post("/auth/onboarding", payload);
  return data;
};
