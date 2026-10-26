// src/features/gamification/api/gamification.api.ts

import { api } from "@/lib/axios";
import type {
  GamificationOverview,
  CoachMemberGamification,
  SendEncouragementPayload,
} from "../types/gamification.types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export const getMyGamification = async (): Promise<GamificationOverview> => {
  const response = await api.get<ApiResponse<GamificationOverview>>("/gamification/me");
  return response.data.data;
};

export const getMemberGamification = async (
  memberId: string,
): Promise<CoachMemberGamification> => {
  const response = await api.get<ApiResponse<CoachMemberGamification>>(
    `/gamification/member/${memberId}`,
  );
  return response.data.data;
};

export const sendEncouragement = async (
  memberId: string,
  payload: SendEncouragementPayload,
): Promise<{ message: string }> => {
  const response = await api.post<ApiResponse<{ message: string }>>(
    `/gamification/coach/encourage/${memberId}`,
    payload,
  );
  return response.data.data;
};
