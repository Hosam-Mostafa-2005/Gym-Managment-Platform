import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelWorkoutSession } from "../api/workout-sessions.api";

export const useCancelWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelWorkoutSession(id, reason),
    onSuccess: () => {
      toast.success("Active workout session abandoned.");
      queryClient.invalidateQueries({ queryKey: ["current-workout-session"] });
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to abandon workout session.";
      toast.error(message);
    },
  });
};
