import { Types } from "mongoose";

export interface IWorkoutExerciseLog {
  session: Types.ObjectId;

  exercise: Types.ObjectId;

  exerciseName: string;

  targetSets: number;

  targetReps: string;

  order: number;

  completed: boolean;
}
