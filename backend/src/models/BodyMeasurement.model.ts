import { Schema, model } from "mongoose";
import type { IBodyMeasurement } from "../types/body-measurement.types.js";

const bodyMeasurementSchema = new Schema<IBodyMeasurement>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Member reference is required"],
    },
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trainer reference is required"],
    },

    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [20, "Weight must be at least 20 kg"],
      max: [400, "Weight seems abnormally high, please verify"],
    },
    height: {
      type: Number,
      required: [true, "Height is required"],
      min: [50, "Height must be at least 50 cm"],
      max: [300, "Height seems abnormally high, please verify"],
    },
    bodyFat: {
      type: Number,
      min: [0, "Body fat cannot be negative"],
      max: [100, "Body fat cannot exceed 100%"],
    },

    circumferences: {
      chest: { type: Number, min: 0 },
      waist: { type: Number, min: 0 },
      hips: { type: Number, min: 0 },
      shoulders: { type: Number, min: 0 },
      neck: { type: Number, min: 0 },
      leftArm: { type: Number, min: 0 },
      rightArm: { type: Number, min: 0 },
      leftThigh: { type: Number, min: 0 },
      rightThigh: { type: Number, min: 0 },
      leftCalf: { type: Number, min: 0 },
      rightCalf: { type: Number, min: 0 },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    measuredAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// INDEXES FOR SCALABILITY & FAST QUERYING
// ==========================================

bodyMeasurementSchema.index({
  member: 1,
  isActive: 1,
  measuredAt: -1,
});

bodyMeasurementSchema.index({
  trainer: 1,
  measuredAt: -1,
});

bodyMeasurementSchema.index({
  member: 1,
  trainer: 1,
});

const BodyMeasurement = model<IBodyMeasurement>(
  "BodyMeasurement",
  bodyMeasurementSchema,
);

export default BodyMeasurement;
