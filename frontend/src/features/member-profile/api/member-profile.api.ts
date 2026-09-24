import { api } from "@/lib/axios";

import type {
  ApiResponse,
  MemberProfileResponse,
} from "../types/member-profile.types";

export const getMemberProfile = async (
  memberId: string,
): Promise<MemberProfileResponse> => {
  const response = await api.get<ApiResponse<MemberProfileResponse>>(
    `/member-profile/${memberId}`,
  );

  return response.data.data;
};
