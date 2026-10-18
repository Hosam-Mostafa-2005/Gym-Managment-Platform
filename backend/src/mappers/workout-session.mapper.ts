const mapWorkoutSession = (session: any) => ({
  id: session._id ?? session.id,
  assignment: session.assignment,
  status: session.status,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
  duration: session.duration ?? 0,
  progress: session.progress ?? 0,
  totalRestTime: session.totalRestTime ?? 0,
  activeTrainingTime: session.activeTrainingTime ?? 0,
  totalVolume: session.totalVolume ?? 0,
  exercisesCompleted: session.exercisesCompleted ?? 0,
  setsCompleted: session.setsCompleted ?? 0,
  notes: session.notes,
});

export default mapWorkoutSession;
