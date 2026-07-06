import { Schema, model } from "mongoose";
import { Equipment, Difficulty } from "../constants/exercise.js";
import { Category } from "../constants/workout.js";
import z from "zod";
import { createWorkoutSchema } from "../validators/workout.validator.js";

const workoutExerciseSchema = new Schema(
  {
    exercise: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },

    sets: {
      type: Number,
      required: true,
      min: 1,
    },

    reps: {
      type: String,
      required: true,
      trim: true,
    },

    restSeconds: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const workoutSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      enum: Object.values(Category),
      required: true,
    },

    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      required: true,
    },

    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },

    tags: {
      type: [String],
      default: [],
    },

    isTemplate: {
      type: Boolean,
      default: false,
    },

    exercises: {
      type: [workoutExerciseSchema],
      validate: [
        (value: unknown[]) => value.length > 0,
        "Workout must contain at least one exercise.",
      ],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

export const updateWorkoutSchema = z.object({
  body: createWorkoutSchema.shape.body.partial(),
});

const Workout = model("Workout", workoutSchema);

export default Workout;
