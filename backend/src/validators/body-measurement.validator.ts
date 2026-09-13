// src/validators/body-measurement.validator.ts
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const circumferencesSchema = z
  .object({
    chest: z.number().nonnegative().optional(),
    waist: z.number().nonnegative().optional(),
    hips: z.number().nonnegative().optional(),
    shoulders: z.number().nonnegative().optional(),
    neck: z.number().nonnegative().optional(),
    leftArm: z.number().nonnegative().optional(),
    rightArm: z.number().nonnegative().optional(),
    leftThigh: z.number().nonnegative().optional(),
    rightThigh: z.number().nonnegative().optional(),
    leftCalf: z.number().nonnegative().optional(),
    rightCalf: z.number().nonnegative().optional(),
  })
  .optional();

export const createBodyMeasurementSchema = z.object({
  body: z.object({
    member: objectIdSchema,
    trainer: objectIdSchema,
    weight: z.number().min(20).max(400),
    height: z.number().min(50).max(300),
    bodyFat: z.number().min(0).max(100).optional(),
    circumferences: circumferencesSchema,
    notes: z.string().max(1000).optional(),
    measuredAt: z.coerce.date().optional(),
  }),
});

export const updateBodyMeasurementSchema = z.object({
  body: z.object({
    weight: z.number().min(20).max(400).optional(),
    height: z.number().min(50).max(300).optional(),
    bodyFat: z.number().min(0).max(100).optional(),
    circumferences: circumferencesSchema,
    notes: z.string().max(1000).optional(),
    measuredAt: z.coerce.date().optional(),
  }),
});
