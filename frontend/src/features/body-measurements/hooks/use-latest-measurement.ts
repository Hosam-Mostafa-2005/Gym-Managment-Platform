// src/features/body-measurements/hooks/use-latest-measurement.ts
import { useQuery } from "@tanstack/react-query";
import { getLatestMeasurement } from "../api/body-measurements.api";

export const useLatestMeasurement = (memberId?: string) => {
  return useQuery({
    queryKey: ["body-measurements", "latest", memberId],
    queryFn: () => getLatestMeasurement(memberId!),
    enabled: Boolean(memberId),
  });
};
