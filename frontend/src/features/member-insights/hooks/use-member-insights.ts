// src/features/member-insights/hooks/use-member-insights.ts

import { useQuery } from "@tanstack/react-query";
import { getMemberInsights } from "../api/member-insights.api";

export const useMemberInsights = (memberId?: string) => {
  return useQuery({
    queryKey: ["member-insights", memberId],
    queryFn: () => getMemberInsights(memberId!),
    enabled: Boolean(memberId),
  });
};
