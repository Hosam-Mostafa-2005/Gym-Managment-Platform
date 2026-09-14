// src/mappers/body-measurement.mapper.ts
import type { IBodyMeasurement } from "../types/body-measurement.types.js";
import type { Document, Types } from "mongoose";

type BodyMeasurementDoc = Document<unknown, {}, IBodyMeasurement> &
  IBodyMeasurement & { _id: Types.ObjectId };

export const mapBodyMeasurement = (doc: BodyMeasurementDoc) => {
  return {
    id: doc._id.toString(),
    member: doc.member.toString(),
    trainer: doc.trainer.toString(),
    weight: doc.weight,
    height: doc.height,
    bodyFat: doc.bodyFat,
    circumferences: doc.circumferences,
    notes: doc.notes,
    measuredAt: doc.measuredAt,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
