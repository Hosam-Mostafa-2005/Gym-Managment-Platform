import { api } from "@/lib/axios";

import type {
  MemberDashboard,
  TrainerDashboard,
} from "../types/dashboard.types";

export const getMemberDashboard = async (): Promise<MemberDashboard> => {
  const { data } = await api.get("/dashboard/member");

  return data.data.dashboard;
};

export const getTrainerDashboard = async (): Promise<TrainerDashboard> => {
  const { data } = await api.get("/dashboard/trainer");

  return data.data.dashboard;
};
