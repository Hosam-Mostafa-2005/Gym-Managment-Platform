import { Types } from "mongoose";

export interface IWorkoutSetLog {
  // التمرين اللي المجموعة دي تابعة ليه
  exerciseLog: Types.ObjectId;

  // ترتيب المجموعة
  setNumber: number;

  // الهدف
  targetReps?: string;

  // اللي العضو عمله فعلاً
  actualReps: number;

  weight: number;

  // Rest Timer
  restDuration?: number;

  // وقت بداية المجموعة
  startedAt?: Date;

  // وقت إنهائها
  completedAt?: Date;

  completed: boolean;
}
export interface CreateWorkoutSetDto {
  exerciseLog: string;

  setNumber: number;

  targetReps?: string;

  actualReps: number;

  weight: number;
}

export interface UpdateWorkoutSetDto {
  actualReps?: number;

  weight?: number;

  completed?: boolean;
}
