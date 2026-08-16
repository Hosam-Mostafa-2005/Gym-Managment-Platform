import { Schema, model } from "mongoose";

import type { IWorkoutSetLog } from "../types/workout-set.types.js";

const workoutSetLogSchema = new Schema<IWorkoutSetLog>(
  {
    exerciseLog: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutExerciseLog",
      required: true,
    },

    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    targetReps: {
      type: String,
      trim: true,
    },

    actualReps: {
      type: Number,
      default: 0,
      min: 0,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    restDuration: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const WorkoutSetLog = model<IWorkoutSetLog>(
  "WorkoutSetLog",
  workoutSetLogSchema,
);

export default WorkoutSetLog;
