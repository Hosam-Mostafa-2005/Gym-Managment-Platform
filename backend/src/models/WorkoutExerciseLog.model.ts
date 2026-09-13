import { Schema, model } from "mongoose";
import type { IWorkoutExerciseLog } from "../types/workout-exercise.types.js";

const workoutExerciseLogSchema = new Schema<IWorkoutExerciseLog>(
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

    // Snapshot
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },

    targetSets: {
      type: Number,
      required: true,
      min: 1,
    },

    targetReps: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

workoutExerciseLogSchema.virtual("sets", {
  ref: "WorkoutSetLog",
  localField: "_id",
  foreignField: "exerciseLog",
});

workoutExerciseLogSchema.index(
  {
    session: 1,
    order: 1,
  },
  {
    unique: true,
  },
);

workoutExerciseLogSchema.index({
  session: 1,
  completed: 1,
});

const WorkoutExerciseLog = model<IWorkoutExerciseLog>(
  "WorkoutExerciseLog",
  workoutExerciseLogSchema,
);

export default WorkoutExerciseLog;
