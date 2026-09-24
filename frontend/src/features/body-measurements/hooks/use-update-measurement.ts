// src/features/body-measurements/hooks/use-update-measurement.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateBodyMeasurement } from "../api/body-measurements.api";
import type { UpdateBodyMeasurementDto } from "../types/body-measurements.types";

export const useUpdateMeasurement = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBodyMeasurementDto;
    }) => updateBodyMeasurement(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["body-measurements", memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["body-measurements", "latest", memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["body-measurement", data.id],
      });
      toast.success("Measurement updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update measurement.");
    },
  });
};
