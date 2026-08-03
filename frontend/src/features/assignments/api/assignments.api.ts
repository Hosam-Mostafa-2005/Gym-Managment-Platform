import { api } from "@/lib/axios";

import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "../types/assignment.types";

export const getAssignments = async (page = 1, limit = 10) => {
  const { data } = await api.get("/assignments", {
    params: {
      page,
      limit,
    },
  });

  return data;
};

export const getAssignment = async (id: string): Promise<Assignment> => {
  const { data } = await api.get(`/assignments/${id}`);

  return data.data.assignment;
};

export const getMyAssignments = async (): Promise<Assignment[]> => {
  const { data } = await api.get("/assignments/me");

  return data.data.assignments;
};

export const createAssignment = async (assignment: CreateAssignmentPayload) => {
  const { data } = await api.post("/assignments", assignment);

  return data.data.assignment as Assignment;
};

export const updateAssignment = async (
  id: string,
  assignment: UpdateAssignmentPayload,
) => {
  const { data } = await api.patch(`/assignments/${id}`, assignment);

  return data.data.assignment as Assignment;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await api.delete(`/assignments/${id}`);
};

export const archiveAssignment = async (id: string): Promise<void> => {
  await api.patch(`/assignments/${id}/archive`);
};
