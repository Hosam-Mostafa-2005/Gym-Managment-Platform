import { api } from "@/lib/axios";

import type { LoginRequest, LoginResponse } from "../types/auth.types.ts";
import type { RegisterRequest } from "../types/auth.types.ts";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};
export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");

  return data.data.user;
};
