import type { Role } from "@/constants/roles";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
