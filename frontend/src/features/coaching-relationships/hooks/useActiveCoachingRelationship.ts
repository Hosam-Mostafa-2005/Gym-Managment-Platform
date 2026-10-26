import { useQuery } from "@tanstack/react-query";
import { getMemberActiveRelationship } from "../api/coaching-relationships.api";

export const useActiveCoachingRelationship = () => {
  return useQuery({
    queryKey: ["coaching-relationships", "member-active"],
    queryFn: getMemberActiveRelationship,
  });
};
