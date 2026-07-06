import { Schema, model } from "mongoose";
import { Equipment, Difficulty } from "../constants/exercise.js";
const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    videoUrl: {
      type: String,
      trim: true,
    },

    equipment: [
      {
        type: String,
        enum: Object.values(Equipment),
        required: true,
      },
    ],

    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      required: true,
    },

    primaryMuscles: [
      {
        type: String,
        trim: true,
      },
    ],

    secondaryMuscles: [
      {
        type: String,
        trim: true,
      },
    ],

    instructions: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],

    tips: [
      {
        type: String,
        trim: true,
      },
    ],

    alternatives: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exercise",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Exercise = model("Exercise", exerciseSchema);

export default Exercise;
