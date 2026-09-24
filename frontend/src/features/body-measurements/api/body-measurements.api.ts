// src/features/body-measurements/api/body-measurements.api.ts

import { api } from "@/lib/axios";
import type {
  BodyMeasurement,
  CreateBodyMeasurementDto,
  MeasurementsListResponse,
  MeasurementResponse,
  UpdateBodyMeasurementDto,
} from "../types/body-measurements.types";

export const getMemberMeasurements = async (
  memberId: string,
): Promise<BodyMeasurement[]> => {
  const response = await api.get<MeasurementsListResponse>(
    `/body-measurements/member/${memberId}`,
  );
  return response.data.data.measurements;
};

export const getLatestMeasurement = async (
  memberId: string,
): Promise<BodyMeasurement | null> => {
  try {
    const response = await api.get<MeasurementResponse>(
      `/body-measurements/member/${memberId}/latest`,
    );
    return response.data.data.measurement;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getMeasurementById = async (
  id: string,
): Promise<BodyMeasurement> => {
  const response = await api.get<MeasurementResponse>(
    `/body-measurements/${id}`,
  );
  return response.data.data.measurement;
};

export const createBodyMeasurement = async (
  data: CreateBodyMeasurementDto,
): Promise<BodyMeasurement> => {
  const response = await api.post<MeasurementResponse>(
    `/body-measurements`,
    data,
  );
  return response.data.data.measurement;
};

export const updateBodyMeasurement = async (
  id: string,
  data: UpdateBodyMeasurementDto,
): Promise<BodyMeasurement> => {
  const response = await api.patch<MeasurementResponse>(
    `/body-measurements/${id}`,
    data,
  );
  return response.data.data.measurement;
};

export const deleteBodyMeasurement = async (id: string): Promise<void> => {
  await api.delete(`/body-measurements/${id}`);
};
