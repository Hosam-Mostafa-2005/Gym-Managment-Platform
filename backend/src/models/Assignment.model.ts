import { Schema, model } from "mongoose";
import type { IAssignment } from "../types/assignment.types.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

const assignmentSchema = new Schema<IAssignment>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workout: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUS),
      default: ASSIGNMENT_STATUS.ACTIVE,
    },

    notes: {
      type: String,
      trim: true,
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

export const Assignment = model<IAssignment>("Assignment", assignmentSchema);
