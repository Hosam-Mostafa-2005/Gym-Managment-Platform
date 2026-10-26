export interface IWorkoutExerciseLog {
  id?: string;
  session: string;
  exercise: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  order: number;
  completed: boolean;
}
