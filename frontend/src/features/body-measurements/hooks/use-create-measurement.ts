// src/features/body-measurements/hooks/use-create-measurement.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success("Measurement added successfully.");
    },
    onError: () => {
      toast.error("Failed to add measurement.");
    },
  });
};
