// src/features/body-measurements/types/body-measurements.types.ts

export interface Circumferences {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  neck?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
}

export interface BodyMeasurement {
  id: string;
  member: string;
  trainer: string;
  weight: number;
  height: number;
  bodyFat?: number;
  circumferences: Circumferences;
  notes?: string;
  measuredAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBodyMeasurementDto {
  member: string;
  trainer: string;
  weight: number;
  height: number;
  bodyFat?: number;
  circumferences?: Circumferences;
  notes?: string;
  measuredAt?: string;
}

export type UpdateBodyMeasurementDto = Partial<CreateBodyMeasurementDto>;

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export interface MeasurementsListResponse {
  status: "success";
  results: number;
  data: {
    measurements: BodyMeasurement[];
  };
}

export interface MeasurementResponse {
  status: "success";
  data: {
    measurement: BodyMeasurement;
  };
}
