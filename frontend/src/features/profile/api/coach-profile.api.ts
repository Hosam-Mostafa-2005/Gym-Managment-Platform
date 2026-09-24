import { api } from "@/lib/axios";
import type { CoachProfileResponse } from "../types/profile.types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export const getCoachProfile = async (): Promise<CoachProfileResponse> => {
  const response =
    await api.get<ApiResponse<CoachProfileResponse>>("/coach-profile");

  return response.data.data;
};
