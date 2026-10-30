// src/features/scheduling/hooks/useScheduling.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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
      toast.success(i18n.t("trainingCalendar:toasts.scheduledSuccess"));
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.scheduledError");
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
      toast.success(i18n.t("trainingCalendar:toasts.updatedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.updatedError");
      toast.error(message);
    },
  });
};

export const useCancelScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulingApi.cancelScheduledWorkout(id),
    onSuccess: () => {
      toast.success(i18n.t("trainingCalendar:toasts.cancelledSuccess"));
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.cancelledError");
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
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.startError");
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
      toast.success(i18n.t("trainingCalendar:toasts.coachScheduledSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.coachScheduledError");
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
      toast.success(i18n.t("trainingCalendar:toasts.coachCancelledSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.coachCancelledError");
      toast.error(message);
    },
  });
};

export const useUpdateCoachScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { scheduledAt?: string; notes?: string; status?: string };
    }) => schedulingApi.updateCoachScheduledWorkout(id, payload),
    onSuccess: () => {
      toast.success(i18n.t("trainingCalendar:toasts.coachUpdatedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.coachUpdatedError");
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
      toast.success(i18n.t("trainingCalendar:toasts.appointmentBookedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.appointmentBookedError");
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
      toast.success(i18n.t("trainingCalendar:toasts.appointmentUpdatedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.appointmentUpdatedError");
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
      toast.success(i18n.t("trainingCalendar:toasts.appointmentCompletedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.appointmentCompletedError");
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
      toast.success(i18n.t("trainingCalendar:toasts.appointmentNoShowSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.appointmentNoShowError");
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
      toast.success(i18n.t("trainingCalendar:toasts.appointmentCancelledSuccess"));
      queryClient.invalidateQueries({ queryKey: ["coach-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-agenda-summary"] });
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || i18n.t("trainingCalendar:toasts.appointmentCancelledError");
      toast.error(message);
    },
  });
};
