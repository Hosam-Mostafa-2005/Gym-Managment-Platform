const mapWorkoutLog = (log: any) => ({
  id: log._id,

  exercise: {
    id: log.exercise._id,
    name: log.exercise.name,
    category: log.exercise.category,
    muscleGroup: log.exercise.muscleGroup,
  },

  sets: log.sets,

  notes: log.notes,

  performedAt: log.performedAt,
});

export default mapWorkoutLog;
