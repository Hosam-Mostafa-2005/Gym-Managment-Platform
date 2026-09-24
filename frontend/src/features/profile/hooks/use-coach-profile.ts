import { useQuery } from "@tanstack/react-query";
import { getCoachProfile } from "../api/coach-profile.api";

export const useCoachProfile = () => {
  return useQuery({
    queryKey: ["coach-profile"],
    queryFn: getCoachProfile,
  });
};
