import { api } from "@/lib/axios";
import type { MemberProfileResponse } from "../types/profile.types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export interface UpdateMemberProfilePayload {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  fitnessGoal?: string | null;
  experienceLevel?: string | null;
}

export const getMemberProfile = async (
  memberId: string,
): Promise<MemberProfileResponse> => {
  const response = await api.get<ApiResponse<MemberProfileResponse>>(
    `/member-profile/${memberId}`,
  );

  return response.data.data;
};

export const updateMemberProfile = async (
  memberId: string,
  payload: UpdateMemberProfilePayload,
): Promise<any> => {
  const response = await api.patch<ApiResponse<{ user: any }>>(
    `/member-profile/${memberId}`,
    payload,
  );

  return response.data.data;
};
