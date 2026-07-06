const mapWorkout = (workout: any) => {
  return {
    id: workout._id,

    title: workout.title,

    description: workout.description,

    category: workout.category,

    difficulty: workout.difficulty,

    estimatedDuration: workout.estimatedDuration,

    exerciseCount: workout.exercises.length,

    tags: workout.tags,

    isTemplate: workout.isTemplate,
  };
};

export default mapWorkout;
