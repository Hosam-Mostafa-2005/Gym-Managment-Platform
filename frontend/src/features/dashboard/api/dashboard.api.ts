import { api } from "@/lib/axios";

import type {
  MemberDashboardData,
  MemberDashboardResponse,
} from "../types/dashboard.types";

export const getMemberDashboard = async (): Promise<MemberDashboardData> => {
  const response = await api.get<MemberDashboardResponse>("/dashboard/member");

  return response.data.data;
};
