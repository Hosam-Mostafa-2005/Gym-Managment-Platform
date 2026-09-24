// src/features/body-measurements/hooks/use-delete-measurement.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteBodyMeasurement } from "../api/body-measurements.api";

export const useDeleteMeasurement = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBodyMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["body-measurements", memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["body-measurements", "latest", memberId],
      });
      toast.success("Measurement deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete measurement.");
    },
  });
};
