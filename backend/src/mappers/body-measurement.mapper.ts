// src/mappers/body-measurement.mapper.ts
import type { IBodyMeasurement } from "../types/body-measurement.types.js";
import type { Document, Types } from "mongoose";

type BodyMeasurementDoc = Document<unknown, {}, IBodyMeasurement> &
  IBodyMeasurement & { _id: Types.ObjectId };

export const mapBodyMeasurement = (doc: BodyMeasurementDoc) => {
  const memberObj = doc.member as any;
  const trainerObj = doc.trainer as any;

  return {
    id: doc._id.toString(),
    member: memberObj?._id ? memberObj._id.toString() : doc.member.toString(),
    trainer: trainerObj?._id
      ? trainerObj._id.toString()
      : doc.trainer.toString(),
    ...(trainerObj?.name ? { trainerName: trainerObj.name } : {}),
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
