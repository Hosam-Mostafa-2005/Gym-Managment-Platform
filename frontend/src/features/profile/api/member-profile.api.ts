import { api } from "@/lib/axios";
import type { MemberProfileResponse } from "../types/profile.types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export const getMemberProfile = async (
  memberId: string,
): Promise<MemberProfileResponse> => {
  const response = await api.get<ApiResponse<MemberProfileResponse>>(
    `/member-profile/${memberId}`,
  );

  return response.data.data;
};
