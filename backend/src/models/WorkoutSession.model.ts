import { Schema, model } from "mongoose";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import type { IWorkoutSession } from "../types/workout-session.types.js";

const workoutSessionSchema = new Schema<IWorkoutSession>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(WORKOUT_SESSION_STATUS),
      default: WORKOUT_SESSION_STATUS.IN_PROGRESS,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: Date,

    duration: Number,

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

const WorkoutSession = model<IWorkoutSession>(
  "WorkoutSession",
  workoutSessionSchema,
);

export default WorkoutSession;
