const mapWorkoutSession = (session: any) => ({
  id: session._id,
  assignment: session.assignment,
  status: session.status,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
  duration: session.duration,
});

export default mapWorkoutSession;
