export interface IWorkoutSetLog {
  id?: string;
  exerciseLog: string;
  setNumber: number;
  targetReps?: string;
  actualReps: number;
  weight: number;
  restDuration?: number;
  setType?: string;
  segmentIndex?: number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
  startedAt?: Date;
  completedAt?: Date;
  completed: boolean;
}

export interface CreateWorkoutSetDto {
  exerciseLog: string;
  setNumber: number;
  targetReps?: string | number;
  actualReps?: number;
  weight?: number;
  completed?: boolean;
  setType?: string;
  segmentIndex?: number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
}

export interface UpdateWorkoutSetDto {
  actualReps?: number;
  weight?: number;
  completed?: boolean;
  restDuration?: number;
  setType?: string;
  segmentIndex?: number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
}
