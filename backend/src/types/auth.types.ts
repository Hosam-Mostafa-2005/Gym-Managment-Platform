import type { Role } from "../constants/roles.js";

export interface RegisterDto {
  name: string;
  email: string;
  password: string;

  role: Role;

  bio?: string;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}
