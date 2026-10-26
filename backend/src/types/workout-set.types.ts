export interface IWorkoutSetLog {
  id?: string;
  exerciseLog: string;
  setNumber: number;
  targetReps?: string;
  actualReps: number;
  weight: number;
  restDuration?: number;
  startedAt?: Date;
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
  restDuration?: number;
}
