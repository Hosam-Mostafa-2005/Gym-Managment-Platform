// src/features/body-measurements/hooks/use-delete-measurement.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["gamification"],
      });
      toast.success(
        i18n.t(
          "bodyMeasurements:notifications.deleteSuccess",
          "Measurement deleted successfully.",
        ),
      );
    },
    onError: () => {
      toast.error(
        i18n.t(
          "bodyMeasurements:notifications.deleteError",
          "Failed to delete measurement.",
        ),
      );
    },
  });
};
