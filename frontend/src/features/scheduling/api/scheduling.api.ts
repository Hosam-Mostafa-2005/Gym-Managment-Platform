// src/features/scheduling/api/scheduling.api.ts
import { api } from "@/lib/axios";
import type {
  ScheduledWorkout,
  CoachingAppointment,
  CalendarSummary,
  CoachAgendaSummary,
  CreateScheduledWorkoutPayload,
  CreateCoachScheduledWorkoutPayload,
  UpdateScheduledWorkoutPayload,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  CompleteAppointmentPayload,
  CancelAppointmentPayload,
} from "../types/scheduling.types";

// ==========================================
// MEMBER TRAINING SCHEDULES
// ==========================================
export const getMemberScheduledWorkouts = async (params?: {
  from?: string;
  to?: string;
  status?: string;
}): Promise<ScheduledWorkout[]> => {
  const { data } = await api.get("/scheduled-workouts", { params });
  return data.data.scheduledWorkouts;
};

export const getMemberCalendarSummary = async (): Promise<CalendarSummary> => {
  const { data } = await api.get("/scheduled-workouts/summary");
  return data.data;
};

export const getScheduledWorkoutById = async (
  id: string,
): Promise<ScheduledWorkout> => {
  const { data } = await api.get(`/scheduled-workouts/${id}`);
  return data.data.scheduledWorkout;
};

export const createScheduledWorkout = async (
  payload: CreateScheduledWorkoutPayload,
): Promise<ScheduledWorkout> => {
  const { data } = await api.post("/scheduled-workouts", payload);
  return data.data.scheduledWorkout;
};

export const updateScheduledWorkout = async (
  id: string,
  payload: UpdateScheduledWorkoutPayload,
): Promise<ScheduledWorkout> => {
  const { data } = await api.patch(`/scheduled-workouts/${id}`, payload);
  return data.data.scheduledWorkout;
};

export const cancelScheduledWorkout = async (
  id: string,
): Promise<ScheduledWorkout> => {
  const { data } = await api.delete(`/scheduled-workouts/${id}`);
  return data.data.scheduledWorkout;
};

export const startScheduledWorkout = async (id: string): Promise<any> => {
  const { data } = await api.post(`/scheduled-workouts/${id}/start`);
  return data.data.session;
};

// ==========================================
// COACH TRAINING SCHEDULES
// ==========================================
export const getCoachScheduledWorkouts = async (params?: {
  memberId?: string;
  from?: string;
  to?: string;
  status?: string;
}): Promise<ScheduledWorkout[]> => {
  const { data } = await api.get("/scheduled-workouts/coach", { params });
  return data.data.scheduledWorkouts;
};

export const createCoachScheduledWorkout = async (
  payload: CreateCoachScheduledWorkoutPayload,
): Promise<ScheduledWorkout> => {
  const { data } = await api.post("/scheduled-workouts/coach", payload);
  return data.data.scheduledWorkout;
};

export const updateCoachScheduledWorkout = async (
  id: string,
  payload: { scheduledAt?: string; notes?: string; status?: string },
): Promise<ScheduledWorkout> => {
  const { data } = await api.patch(`/scheduled-workouts/coach/${id}`, payload);
  return data.data.scheduledWorkout;
};

export const cancelCoachScheduledWorkout = async (
  id: string,
  reason?: string,
): Promise<ScheduledWorkout> => {
  const { data } = await api.delete(`/scheduled-workouts/coach/${id}`, {
    data: { reason },
  });
  return data.data.scheduledWorkout;
};

// ==========================================
// COACHING APPOINTMENTS
// ==========================================
export const getMemberAppointments = async (params?: {
  status?: string;
  from?: string;
  to?: string;
}): Promise<CoachingAppointment[]> => {
  const { data } = await api.get("/coaching-appointments/me", { params });
  return data.data.appointments;
};

export const getCoachAppointments = async (params?: {
  memberId?: string;
  status?: string;
  from?: string;
  to?: string;
}): Promise<CoachingAppointment[]> => {
  const { data } = await api.get("/coaching-appointments/coach", { params });
  return data.data.appointments;
};

export const getCoachAgendaSummary = async (): Promise<CoachAgendaSummary> => {
  const { data } = await api.get("/coaching-appointments/coach/agenda");
  return data.data;
};

export const getAppointmentById = async (
  id: string,
): Promise<CoachingAppointment> => {
  const { data } = await api.get(`/coaching-appointments/${id}`);
  return data.data.appointment;
};

export const createCoachAppointment = async (
  payload: CreateAppointmentPayload,
): Promise<CoachingAppointment> => {
  const { data } = await api.post("/coaching-appointments/coach", payload);
  return data.data.appointment;
};

export const updateAppointment = async (
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<CoachingAppointment> => {
  const { data } = await api.patch(`/coaching-appointments/${id}`, payload);
  return data.data.appointment;
};

export const completeCoachAppointment = async (
  id: string,
  payload: CompleteAppointmentPayload,
): Promise<CoachingAppointment> => {
  const { data } = await api.patch(
    `/coaching-appointments/coach/${id}/complete`,
    payload,
  );
  return data.data.appointment;
};

export const markNoShowCoachAppointment = async (
  id: string,
  coachNotes?: string,
): Promise<CoachingAppointment> => {
  const { data } = await api.patch(
    `/coaching-appointments/coach/${id}/no-show`,
    { coachNotes },
  );
  return data.data.appointment;
};

export const cancelAppointment = async (
  id: string,
  payload: CancelAppointmentPayload,
): Promise<CoachingAppointment> => {
  const { data } = await api.patch(
    `/coaching-appointments/${id}/cancel`,
    payload,
  );
  return data.data.appointment;
};
