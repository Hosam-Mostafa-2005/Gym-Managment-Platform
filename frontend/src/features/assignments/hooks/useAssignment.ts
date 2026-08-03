import { useQuery } from "@tanstack/react-query";

import { getAssignment } from "../api/assignments.api";

export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: ["assignments", id],
    queryFn: () => getAssignment(id),
    enabled: !!id,
  });
};
