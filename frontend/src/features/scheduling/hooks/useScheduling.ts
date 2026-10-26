// src/features/scheduling/hooks/useScheduling.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as schedulingApi from "../api/scheduling.api";
import type {
  CreateScheduledWorkoutPayload,
  CreateCoachScheduledWorkoutPayload,
  UpdateScheduledWorkoutPayload,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  CompleteAppointmentPayload,
  CancelAppointmentPayload,
} from "../types/scheduling.types";

// ==========================================
// MEMBER QUERIES
// ==========================================
export const useMemberScheduledWorkouts = (params?: {
  from?: string;
  to?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["member-scheduled-workouts", params],
    queryFn: () => schedulingApi.getMemberScheduledWorkouts(params),
  });
};

export const useMemberCalendarSummary = () => {
  return useQuery({
    queryKey: ["member-calendar-summary"],
    queryFn: schedulingApi.getMemberCalendarSummary,
  });
};

export const useMemberAppointments = (params?: {
  status?: string;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: ["member-appointments", params],
    queryFn: () => schedulingApi.getMemberAppointments(params),
  });
};

// ==========================================
// COACH QUERIES
// ==========================================
export const useCoachScheduledWorkouts = (params?: {
  memberId?: string;
  from?: string;
  to?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["coach-scheduled-workouts", params],
    queryFn: () => schedulingApi.getCoachScheduledWorkouts(params),
  });
};

export const useCoachAppointments = (params?: {
  memberId?: string;
  status?: string;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: ["coach-appointments", params],
    queryFn: () => schedulingApi.getCoachAppointments(params),
  });
};

export const useCoachAgenda = () => {
  return useQuery({
    queryKey: ["coach-agenda-summary"],
    queryFn: schedulingApi.getCoachAgendaSummary,
  });
};

// ==========================================
// MEMBER MUTATIONS
// ==========================================
export const useCreateScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduledWorkoutPayload) =>
      schedulingApi.createScheduledWorkout(payload),
    onSuccess: () => {
      toast.success("Workout scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to schedule workout.";
      toast.error(message);
    },
  });
};

export const useUpdateScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateScheduledWorkoutPayload;
    }) => schedulingApi.updateScheduledWorkout(id, payload),
    onSuccess: () => {
      toast.success("Scheduled workout updated.");
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to update workout schedule.";
      toast.error(message);
    },
  });
};

export const useCancelScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulingApi.cancelScheduledWorkout(id),
    onSuccess: () => {
      toast.success("Scheduled workout cancelled.");
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to cancel workout.";
      toast.error(message);
    },
  });
};

export const useStartScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulingApi.startScheduledWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["current-workout-session"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to start workout session.";
      toast.error(message);
    },
  });
};

// ==========================================
// COACH MUTATIONS
// ==========================================
export const useCreateCoachScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoachScheduledWorkoutPayload) =>
      schedulingApi.createCoachScheduledWorkout(payload),
    onSuccess: () => {
      toast.success("Workout scheduled for athlete successfully!");
      queryClient.invalidateQueries({ queryKey: ["coach-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to schedule athlete workout.";
      toast.error(message);
    },
  });
};

export const useCancelCoachScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      schedulingApi.cancelCoachScheduledWorkout(id, reason),
    onSuccess: () => {
      toast.success("Athlete workout schedule cancelled.");
      queryClient.invalidateQueries({ queryKey: ["coach-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to cancel athlete workout.";
      toast.error(message);
    },
  });
};

export const useCreateCoachAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      schedulingApi.createCoachAppointment(payload),
    onSuccess: () => {
      toast.success("Coaching appointment booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to book coaching appointment.";
      toast.error(message);
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAppointmentPayload;
    }) => schedulingApi.updateAppointment(id, payload),
    onSuccess: () => {
      toast.success("Appointment updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to update appointment.";
      toast.error(message);
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CompleteAppointmentPayload;
    }) => schedulingApi.completeCoachAppointment(id, payload),
    onSuccess: () => {
      toast.success("Appointment marked as completed.");
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to complete appointment.";
      toast.error(message);
    },
  });
};

export const useMarkNoShowAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, coachNotes }: { id: string; coachNotes?: string }) =>
      schedulingApi.markNoShowCoachAppointment(id, coachNotes),
    onSuccess: () => {
      toast.success("Appointment marked as no-show.");
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to mark as no-show.";
      toast.error(message);
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CancelAppointmentPayload;
    }) => schedulingApi.cancelAppointment(id, payload),
    onSuccess: () => {
      toast.success("Appointment cancelled.");
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to cancel appointment.";
      toast.error(message);
    },
  });
};
