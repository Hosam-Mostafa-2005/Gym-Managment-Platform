import { api } from "@/lib/axios";
import type {
  ScheduledWorkout,
  CreateScheduledWorkoutPayload,
  UpdateScheduledWorkoutPayload,
  WorkoutSession,
} from "../types/workout-session.types";

export const getScheduledWorkouts = async (query?: {
  status?: string;
  upcomingOnly?: string;
}): Promise<ScheduledWorkout[]> => {
  const { data } = await api.get("/scheduled-workouts", { params: query });
  return data.data.scheduledWorkouts;
};

export const getScheduledWorkout = async (
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

export const startScheduledWorkout = async (
  id: string,
): Promise<WorkoutSession> => {
  const { data } = await api.post(`/scheduled-workouts/${id}/start`);
  return data.data.session;
};
