const mapExercise = (exercise: any) => {
  return {
    id: exercise._id,
    name: exercise.name,
    description: exercise.description,
    videoUrl: exercise.videoUrl,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
  };
};

export default mapExercise;
