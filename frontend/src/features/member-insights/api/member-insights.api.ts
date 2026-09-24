// src/features/member-insights/api/member-insights.api.ts

import { api } from "@/lib/axios";
import type {
  MemberInsightsResponse,
  ApiResponse,
} from "../types/member-insights.types";

export const getMemberInsights = async (
  memberId: string,
): Promise<MemberInsightsResponse> => {
  const response = await api.get<ApiResponse<MemberInsightsResponse>>(
    `/member-insights/${memberId}`,
  );

  return response.data.data;
};
