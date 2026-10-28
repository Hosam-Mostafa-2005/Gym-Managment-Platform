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
  UpdateWorkoutSetPayload,
  PreviousPerformanceMap,
  SwapExercisePayload,
} from "../types/workout-session.types";

export const getWorkoutSessions = async (
  page = 1,
  limit = 10,
): Promise<WorkoutSessionsResponse> => {
  const { data } = await api.get("/workout-sessions", {
    params: { page, limit },
  });

  return {
    sessions: data.data.sessions.map(mapWorkoutSession),
    results: data.results,
  };
};

export const updateWorkoutSet = async (
  id: string,
  payload: UpdateWorkoutSetPayload,
) => {
  const { data } = await api.patch(`/workout-set-logs/${id}`, payload);

  return data.data.set;
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

export const getPreviousPerformance = async (
  sessionId: string,
): Promise<PreviousPerformanceMap> => {
  const { data } = await api.get(
    `/workout-sessions/${sessionId}/previous-performance`,
  );

  return data.data.previousPerformance ?? {};
};

export const getPreviousPerformanceBatch = async (
  exerciseIds: string[],
  excludeSessionId?: string,
): Promise<PreviousPerformanceMap> => {
  const { data } = await api.post("/workout-sessions/previous-performance", {
    exerciseIds,
    excludeSessionId,
  });

  return data.data.previousPerformance ?? {};
};

export const startWorkoutSession = async (
  payload: StartWorkoutSessionPayload,
) => {
  const { data } = await api.post("/workout-sessions/start", payload);

  return data.data.session;
};

export const finishWorkoutSession = async (
  id: string,
  payload: FinishWorkoutSessionPayload,
): Promise<WorkoutSession> => {
  const { data } = await api.patch(`/workout-sessions/${id}/finish`, payload);

  return data.data.session;
};

export const cancelWorkoutSession = async (
  id: string,
  reason?: string,
): Promise<WorkoutSession> => {
  const { data } = await api.patch(`/workout-sessions/${id}/cancel`, { reason });

  return data.data.session;
};

export const reviewWorkoutSession = async (
  id: string,
  payload: { feedback: string },
): Promise<WorkoutSession> => {
  const { data } = await api.patch(`/workout-sessions/${id}/review`, payload);

  return data.data.session;
};

export const createWorkoutSet = async (payload: CreateWorkoutSetPayload) => {
  const { data } = await api.post("/workout-set-logs", payload);

  return data.data.setLog ?? data.data.set;
};

export const deleteWorkoutSet = async (id: string) => {
  const { data } = await api.delete(`/workout-set-logs/${id}`);

  return data;
};

export const getMyAssignments = async () => {
  const { data } = await api.get("/assignments/me");

  return data.data.assignments;
};

export const swapExercise = async (
  sessionId: string,
  exerciseLogId: string,
  payload: SwapExercisePayload,
): Promise<WorkoutSessionDetails> => {
  const { data } = await api.patch(
    `/workout-sessions/${sessionId}/exercises/${exerciseLogId}/swap`,
    payload,
  );

  const rawSession = data.data.session ?? data.data;
  return mapWorkoutSessionDetails(rawSession);
};

export const addExerciseToSession = async (
  sessionId: string,
  payload: import("../types/workout-session.types").AddExerciseToSessionPayload,
): Promise<WorkoutSessionDetails> => {
  const { data } = await api.post(
    `/workout-sessions/${sessionId}/exercises`,
    payload,
  );

  const rawSession = data.data.session ?? data.data;
  return mapWorkoutSessionDetails(rawSession);
};
