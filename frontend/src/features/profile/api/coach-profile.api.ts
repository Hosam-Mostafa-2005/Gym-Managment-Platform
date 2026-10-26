import { api } from "@/lib/axios";
import type { CoachProfileResponse } from "../types/profile.types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export interface UpdateCoachProfilePayload {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  professionalTitle?: string | null;
  coachingPhilosophy?: string | null;
  languagesSpoken?: string[];
}

export const getCoachProfile = async (): Promise<CoachProfileResponse> => {
  const response =
    await api.get<ApiResponse<CoachProfileResponse>>("/coach-profile");

  return response.data.data;
};

export const updateCoachProfile = async (
  payload: UpdateCoachProfilePayload,
): Promise<any> => {
  const response = await api.patch<ApiResponse<any>>("/coach-profile", payload);
  return response.data.data;
};
