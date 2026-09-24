// src/features/member-profile/hooks/use-member-profile.ts

import { useQuery } from "@tanstack/react-query";
import { getMemberProfile } from "../api/member-profile.api";

export const useMemberProfile = (memberId?: string) => {
  return useQuery({
    queryKey: ["member-profile", memberId],
    queryFn: () => getMemberProfile(memberId!),
    enabled: Boolean(memberId),
  });
};
