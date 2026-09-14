import { Types } from "mongoose";

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: Date;
}

export interface WorkoutStats {
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  totalVolume: number;
}

export interface MemberProfileMapperInput {
  member: any;
  currentAssignment: any | null;
  assignmentHistory: any[];
  measurements: any[];
  workoutStats: WorkoutStats | null;
  recentSessions: any[];
  timeline: TimelineEvent[];
}
