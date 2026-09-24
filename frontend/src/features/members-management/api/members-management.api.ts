import { api } from "@/lib/axios";
import type {
  MembersManagementQuery,
  MembersManagementResponse,
} from "../types/members-management.types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export const getMembersManagement = async (
  params?: MembersManagementQuery,
): Promise<MembersManagementResponse> => {
  const response = await api.get<ApiResponse<MembersManagementResponse>>(
    "/members-management",
    {
      params,
    },
  );

  return response.data.data;
};
