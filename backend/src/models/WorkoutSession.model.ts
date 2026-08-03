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

    // وقت بداية التمرين
    startedAt: {
      type: Date,
      default: Date.now,
    },

    // وقت انتهاء التمرين
    endedAt: {
      type: Date,
    },

    // مدة السيشن كاملة بالدقائق
    duration: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // مجموع وقت الراحة بالثواني
    totalRestTime: {
      type: Number,
      default: 0,
    },

    // الوقت الفعلي للتمرين (بدون الراحة) بالثواني
    activeTrainingTime: {
      type: Number,
      default: 0,
    },

    // إجمالي حجم التمرين (Weight × Reps)
    totalVolume: {
      type: Number,
      default: 0,
    },

    // عدد التمارين المنفذة
    exercisesCompleted: {
      type: Number,
      default: 0,
    },

    // عدد المجموعات المنفذة
    setsCompleted: {
      type: Number,
      default: 0,
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

const WorkoutSession = model<IWorkoutSession>(
  "WorkoutSession",
  workoutSessionSchema,
);

export default WorkoutSession;
