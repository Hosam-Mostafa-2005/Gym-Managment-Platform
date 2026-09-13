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

// ============================================================================
// INDEXES
// ============================================================================

// Used to prevent duplicate set numbers within the same exercise
workoutSetLogSchema.index({ exerciseLog: 1, setNumber: 1 }, { unique: true });

// Used when counting completed sets
workoutSetLogSchema.index({
  exerciseLog: 1,
  completed: 1,
});

// Used in dashboard aggregations (volume calculations)
workoutSetLogSchema.index({
  exerciseLog: 1,
});

// Used for recent workout history
workoutSetLogSchema.index({
  completedAt: -1,
});

const WorkoutSetLog = model<IWorkoutSetLog>(
  "WorkoutSetLog",
  workoutSetLogSchema,
);

export default WorkoutSetLog;
