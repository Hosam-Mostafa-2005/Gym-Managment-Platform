import prisma from "../config/prisma.js";

async function main() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          workoutExercises: true,
          workoutExerciseLogs: true,
          memberAccess: true,
          alternatives: true,
          alternativeTo: true,
        },
      },
    },
  });

  console.log(`Total exercises: ${exercises.length}\n`);
  for (const ex of exercises) {
    console.log(
      `ID: ${ex.id} | Name: "${ex.name}" | isCustom: ${ex.isCustom} | Equip: [${ex.equipment.join(
        ", "
      )}] | Primary: [${ex.primaryMuscles.join(
        ", "
      )}] | Secondary: [${ex.secondaryMuscles.join(
        ", "
      )}] | Workouts: ${ex._count.workoutExercises} | Logs: ${ex._count.workoutExerciseLogs} | Alts: ${ex._count.alternatives + ex._count.alternativeTo}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
