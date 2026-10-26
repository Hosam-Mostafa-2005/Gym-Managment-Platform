// src/mappers/workout.mapper.ts
const mapWorkout = (workout: any) => {
  const firstExercise =
    Array.isArray(workout.exercises) && workout.exercises.length > 0
      ? workout.exercises[0].exercise ?? workout.exercises[0]
      : null;

  return {
    id: workout.id ?? workout._id,
    title: workout.title,
    description: workout.description,
    category: workout.category,
    difficulty: workout.difficulty,
    estimatedDuration: workout.estimatedDuration,
    exerciseCount: Array.isArray(workout.exercises)
      ? workout.exercises.length
      : 0,
    imageUrl: firstExercise?.imageUrl ?? null,
    tags: workout.tags ?? [],
    isTemplate: workout.isTemplate ?? false,
    createdBy: workout.createdBy,
  };
};

export default mapWorkout;
