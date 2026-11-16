import prisma from "../config/prisma.js";

async function main() {
  const all = await prisma.exercise.findMany({ orderBy: { name: "asc" } });
  console.log(`Total exercises: ${all.length}`);

  const byPrimary: Record<string, number> = {};
  const byEquipment: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};

  for (const ex of all) {
    for (const m of ex.primaryMuscles) {
      byPrimary[m] = (byPrimary[m] || 0) + 1;
    }
    for (const eq of ex.equipment) {
      byEquipment[eq] = (byEquipment[eq] || 0) + 1;
    }
    byDifficulty[ex.difficulty] = (byDifficulty[ex.difficulty] || 0) + 1;
  }

  console.log("\n--- Primary Muscle Counts ---");
  console.log(byPrimary);

  console.log("\n--- Equipment Counts ---");
  console.log(byEquipment);

  console.log("\n--- Difficulty Counts ---");
  console.log(byDifficulty);

  console.log("\n--- Custom Exercises ---");
  const custom = all.filter((e) => e.isCustom);
  console.log(
    custom.map((c) => ({
      id: c.id,
      name: c.name,
      primary: c.primaryMuscles,
      equipment: c.equipment,
      createdById: c.createdById,
    }))
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
