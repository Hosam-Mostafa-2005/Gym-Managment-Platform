import { useQuery } from "@tanstack/react-query";

import { getMemberDashboard } from "../api/dashboard.api";

export const useMemberDashboard = () => {
  return useQuery({
    queryKey: ["member-dashboard"],
    queryFn: getMemberDashboard,
  });
};
