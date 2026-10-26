export interface IBodyMeasurement {
  id?: string;
  member: string;
  trainer: string;

  // Basic Stats
  weight: number; // in kg
  height: number; // in cm
  bodyFat?: number; // percentage (0-100)

  // Measurements (in cm)
  circumferences: {
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
  };

  // Metadata
  notes?: string;
  measuredAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBodyMeasurementDto {
  member: string;
  trainer: string;

  weight: number;
  height: number;
  bodyFat?: number;

  circumferences?: {
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
  };

  notes?: string;
  measuredAt?: Date;
}

export type UpdateBodyMeasurementDto = Partial<
  Omit<CreateBodyMeasurementDto, "member" | "trainer">
>;
