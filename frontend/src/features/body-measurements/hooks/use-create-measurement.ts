// src/features/body-measurements/hooks/use-create-measurement.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { createBodyMeasurement } from "../api/body-measurements.api";

export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBodyMeasurement,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["body-measurements", variables.member],
      });
      queryClient.invalidateQueries({
        queryKey: ["body-measurements", "latest", variables.member],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["gamification"],
      });
      toast.success(
        i18n.t(
          "bodyMeasurements:notifications.createSuccess",
          "Measurement added successfully.",
        ),
      );
    },
    onError: () => {
      toast.error(
        i18n.t(
          "bodyMeasurements:notifications.createError",
          "Failed to add measurement.",
        ),
      );
    },
  });
};
