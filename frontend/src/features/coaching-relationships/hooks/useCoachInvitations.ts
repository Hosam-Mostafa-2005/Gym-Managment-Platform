import { useQuery } from "@tanstack/react-query";
import { getCoachInvitations } from "../api/coaching-relationships.api";

export const useCoachInvitations = () => {
  return useQuery({
    queryKey: ["coaching-relationships", "coach-invitations"],
    queryFn: getCoachInvitations,
  });
};
