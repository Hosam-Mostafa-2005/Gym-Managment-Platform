const mapExercise = (exercise: any) => {
  return {
    id: exercise.id ?? exercise._id,
    name: exercise.name,
    description: exercise.description,
    imageUrl: exercise.imageUrl ?? null,
    videoUrl: exercise.videoUrl,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    instructions: exercise.instructions,
    tips: exercise.tips,
    isCustom: exercise.isCustom ?? false,
    createdById: exercise.createdById ?? null,
    alternatives: exercise.alternatives?.map((alt: any) =>
      typeof alt === "object" ? (alt.id ?? alt._id) : alt,
    ),
  };
};

export default mapExercise;
