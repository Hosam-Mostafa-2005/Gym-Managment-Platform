import { api } from "@/lib/axios";

import {
  mapWorkoutSession,
  mapWorkoutSessionDetails,
} from "../mappers/workout-session.mapper";

import type {
  WorkoutSession,
  WorkoutSessionDetails,
  WorkoutSessionsResponse,
  StartWorkoutSessionPayload,
  FinishWorkoutSessionPayload,
  CreateWorkoutSetPayload,
} from "../types/workout-session.types";

export const getWorkoutSessions = async (
  page = 1,
  limit = 10,
): Promise<WorkoutSessionsResponse> => {
  const { data } = await api.get("/workout-sessions/me", {
    params: { page, limit },
  });

  return {
    sessions: data.data.sessions.map(mapWorkoutSession),
    results: data.results,
  };
};

export const getWorkoutSession = async (
  id: string,
): Promise<WorkoutSessionDetails> => {
  const { data } = await api.get(`/workout-sessions/${id}`);

  return mapWorkoutSessionDetails(data.data.session);
};

export const getCurrentWorkoutSession =
  async (): Promise<WorkoutSessionDetails | null> => {
    const { data } = await api.get("/workout-sessions/current");

    if (!data.data.session) return null;

    return mapWorkoutSessionDetails(data.data.session);
  };

export const startWorkoutSession = async (
  payload: StartWorkoutSessionPayload,
): Promise<WorkoutSession> => {
  const { data } = await api.post("/workout-sessions/start", payload);

  return mapWorkoutSession(data.data.session);
};

export const finishWorkoutSession = async (
  id: string,
  payload: FinishWorkoutSessionPayload,
): Promise<WorkoutSession> => {
  const { data } = await api.patch(`/workout-sessions/${id}/finish`, payload);

  return mapWorkoutSession(data.data.session);
};

export const createWorkoutSet = async (payload: CreateWorkoutSetPayload) => {
  const { data } = await api.post("/workout-set-logs", payload);

  return data.data.setLog;
};
