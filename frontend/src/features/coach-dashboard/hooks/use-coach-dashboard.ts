import { useQuery } from "@tanstack/react-query";

import { getCoachDashboard } from "../api/coach-dashboard.api";

export const useCoachDashboard = () => {
  return useQuery({
    queryKey: ["coach-dashboard"],
    queryFn: getCoachDashboard,
  });
};
