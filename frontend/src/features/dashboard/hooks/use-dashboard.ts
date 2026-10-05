import { useQuery } from "@tanstack/react-query";

import { getMemberDashboard } from "../api/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,

  member: () => [...dashboardKeys.all, "member"] as const,
};

export const useMemberDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.member(),
    queryFn: getMemberDashboard,
    staleTime: 60 * 1000,
  });
};
