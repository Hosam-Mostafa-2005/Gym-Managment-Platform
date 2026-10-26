import { useQuery } from "@tanstack/react-query";
import { getMemberInvitations } from "../api/coaching-relationships.api";

export const useMemberInvitations = () => {
  return useQuery({
    queryKey: ["coaching-relationships", "member-invitations"],
    queryFn: getMemberInvitations,
  });
};
