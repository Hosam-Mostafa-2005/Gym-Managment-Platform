import { useQuery } from "@tanstack/react-query";

import { getTrainerDashboard } from "../api/dashboard.api";

export const useTrainerDashboard = () => {
  return useQuery({
    queryKey: ["trainer-dashboard"],
    queryFn: getTrainerDashboard,
  });
};
