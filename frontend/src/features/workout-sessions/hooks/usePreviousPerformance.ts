import { useQuery } from "@tanstack/react-query";
import { getPreviousPerformance } from "../api/workout-sessions.api";
import type { PreviousPerformanceMap } from "../types/workout-session.types";

export function usePreviousPerformance(sessionId?: string) {
  return useQuery<PreviousPerformanceMap>({
    queryKey: ["workout-session-previous-performance", sessionId],
    queryFn: () => getPreviousPerformance(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 5 * 60 * 1000,
  });
}
