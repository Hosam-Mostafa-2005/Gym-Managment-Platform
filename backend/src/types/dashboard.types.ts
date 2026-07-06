export interface TrainerDashboard {
  totalMembers: number;
  totalExercises: number;
  totalWorkouts: number;
  activeAssignments: number;
  activeSessions: number;
  completedSessions: number;
}

export interface MemberDashboard {
  activeAssignment: any;
  totalSessions: number;
  completedSessions: number;
  lastWorkout: any;
  recentLogs: any[];
}
