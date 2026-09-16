import { api } from "@/lib/axios";

import type { CoachDashboard } from "../types/coach-dashboard.types";

export const getCoachDashboard = async (): Promise<CoachDashboard> => {
  const response = await api.get("/coach-dashboard");

  return response.data.data;
};
