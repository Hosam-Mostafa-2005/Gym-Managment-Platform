// src/features/body-measurements/hooks/use-member-measurements.ts
import { useQuery } from "@tanstack/react-query";
import { getMemberMeasurements } from "../api/body-measurements.api";

export const useMemberMeasurements = (memberId?: string) => {
  return useQuery({
    queryKey: ["body-measurements", memberId],
    queryFn: () => getMemberMeasurements(memberId!),
    enabled: Boolean(memberId),
  });
};
