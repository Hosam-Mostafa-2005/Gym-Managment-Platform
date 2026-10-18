import { Schema, model } from "mongoose";

import type { IWorkoutLog, WorkoutSet } from "../types/workout-log.types.js";

const workoutSetSchema = new Schema<WorkoutSet>(
  {
    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    reps: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const workoutLogSchema = new Schema<IWorkoutLog>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: true,
    },

    exercise: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },

    sets: {
      type: [workoutSetSchema],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    performedAt: {
      type: Date,
      default: Date.now,
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

const WorkoutLog = model<IWorkoutLog>("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
