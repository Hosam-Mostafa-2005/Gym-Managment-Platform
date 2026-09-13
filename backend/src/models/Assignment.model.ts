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

    trainer: {
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

    completedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    cancelReason: {
      type: String,
      trim: true,
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

assignmentSchema.index({
  trainer: 1,
  isActive: 1,
});
assignmentSchema.index({
  member: 1,
  isActive: 1,
});
assignmentSchema.index({
  member: 1,
  status: 1,
  isActive: 1,
});
assignmentSchema.index({
  status: 1,
});
assignmentSchema.index({
  createdAt: -1,
});
assignmentSchema.index(
  {
    member: 1,
    workout: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: ASSIGNMENT_STATUS.ACTIVE,
    },
  },
);
export const Assignment = model<IAssignment>("Assignment", assignmentSchema);
