import prisma from "../config/prisma.js";

interface MergePlan {
  canonicalName: string;
  canonicalId: string;
  duplicateIds: string[];
  duplicateNames: string[];
}

async function main() {
  console.log("=================================================");
  console.log("STREN — Exercise Library Deduplication & Merge");
  console.log("=================================================\n");

  // 1. Identify canonical exercises
  const canonicalBench = await prisma.exercise.findFirst({
    where: { name: "Barbell Bench Press", isCustom: false },
  });
  if (!canonicalBench) {
    throw new Error("Canonical 'Barbell Bench Press' not found!");
  }

  const canonicalCurl = await prisma.exercise.findFirst({
    where: { name: "Barbell Curl", isCustom: false },
  });
  if (!canonicalCurl) {
    throw new Error("Canonical 'Barbell Curl' not found!");
  }

  const canonicalHammer = await prisma.exercise.findFirst({
    where: { name: "Hammer Curl", isCustom: false },
  });
  if (!canonicalHammer) {
    throw new Error("Canonical 'Hammer Curl' not found!");
  }

  const canonicalDeadlift = await prisma.exercise.findFirst({
    where: { name: "Conventional Deadlift", isCustom: false },
  });
  if (!canonicalDeadlift) {
    throw new Error("Canonical 'Conventional Deadlift' not found!");
  }

  const canonicalCableCurl = await prisma.exercise.findFirst({
    where: { name: "Cable Curl", isCustom: false },
  });
  if (!canonicalCableCurl) {
    throw new Error("Canonical 'Cable Curl' not found!");
  }

  // 2. Find all duplicates
  // A. Barbell Bench Press test duplicates (e.g., "Barbell Bench Press 0a6cd624")
  const benchDupes = await prisma.exercise.findMany({
    where: {
      name: { startsWith: "Barbell Bench Press " },
      id: { not: canonicalBench.id },
    },
  });

  // B. Barbell Curl test duplicates (e.g., "Barbell Curl 34cbc2cc")
  const curlDupes = await prisma.exercise.findMany({
    where: {
      name: { startsWith: "Barbell Curl " },
      id: { not: canonicalCurl.id },
    },
  });

  // C. Hammer Curls (plural duplicate)
  const hammerDupes = await prisma.exercise.findMany({
    where: {
      name: "Hammer Curls",
      id: { not: canonicalHammer.id },
    },
  });

  // D. Deadlift111 (test / dev duplicate)
  const deadliftDupes = await prisma.exercise.findMany({
    where: {
      name: "Deadlift111",
      id: { not: canonicalDeadlift.id },
    },
  });

  // E. Cable Biceps Curl (duplicate / redundant entry for Cable Curl)
  const cableDupes = await prisma.exercise.findMany({
    where: {
      name: "Cable Biceps Curl",
      id: { not: canonicalCableCurl.id },
    },
  });

  const mergePlans: MergePlan[] = [
    {
      canonicalName: canonicalBench.name,
      canonicalId: canonicalBench.id,
      duplicateIds: benchDupes.map((d) => d.id),
      duplicateNames: benchDupes.map((d) => d.name),
    },
    {
      canonicalName: canonicalCurl.name,
      canonicalId: canonicalCurl.id,
      duplicateIds: curlDupes.map((d) => d.id),
      duplicateNames: curlDupes.map((d) => d.name),
    },
    {
      canonicalName: canonicalHammer.name,
      canonicalId: canonicalHammer.id,
      duplicateIds: hammerDupes.map((d) => d.id),
      duplicateNames: hammerDupes.map((d) => d.name),
    },
    {
      canonicalName: canonicalDeadlift.name,
      canonicalId: canonicalDeadlift.id,
      duplicateIds: deadliftDupes.map((d) => d.id),
      duplicateNames: deadliftDupes.map((d) => d.name),
    },
    {
      canonicalName: canonicalCableCurl.name,
      canonicalId: canonicalCableCurl.id,
      duplicateIds: cableDupes.map((d) => d.id),
      duplicateNames: cableDupes.map((d) => d.name),
    },
  ];

  console.log("Merge Plans Summary:");
  let totalDuplicates = 0;
  for (const plan of mergePlans) {
    console.log(
      ` -> ${plan.canonicalName} (${plan.canonicalId}): ${plan.duplicateIds.length} duplicate(s) [${plan.duplicateNames.join(
        ", "
      )}]`
    );
    totalDuplicates += plan.duplicateIds.length;
  }
  console.log(`\nTotal duplicate exercises to merge: ${totalDuplicates}\n`);

  if (totalDuplicates === 0) {
    console.log("No duplicates found to merge. Database is clean.");
    return;
  }

  // 3. Execute Merge Transaction with 60s timeout
  await prisma.$transaction(
    async (tx) => {
      for (const plan of mergePlans) {
        if (plan.duplicateIds.length === 0) continue;

        console.log(`\nProcessing: "${plan.canonicalName}"...`);

        // A. Reassign WorkoutExercises
        const weResult = await tx.workoutExercise.updateMany({
          where: { exerciseId: { in: plan.duplicateIds } },
          data: { exerciseId: plan.canonicalId },
        });
        console.log(`  - Reassigned ${weResult.count} WorkoutExercise references.`);

        // B. Reassign WorkoutExerciseLogs
        const welResult = await tx.workoutExerciseLog.updateMany({
          where: { exerciseId: { in: plan.duplicateIds } },
          data: {
            exerciseId: plan.canonicalId,
            exerciseName: plan.canonicalName,
          },
        });
        console.log(`  - Reassigned ${welResult.count} WorkoutExerciseLog references.`);

        // Also originalExerciseId
        const origWelResult = await tx.workoutExerciseLog.updateMany({
          where: { originalExerciseId: { in: plan.duplicateIds } },
          data: { originalExerciseId: plan.canonicalId },
        });
        if (origWelResult.count > 0) {
          console.log(`  - Reassigned ${origWelResult.count} originalExerciseId references.`);
        }

        // C. Handle MemberExerciseAccess
        for (const dupeId of plan.duplicateIds) {
          const accesses = await tx.memberExerciseAccess.findMany({
            where: { exerciseId: dupeId },
          });

          for (const access of accesses) {
            const existing = await tx.memberExerciseAccess.findUnique({
              where: {
                memberId_exerciseId: {
                  memberId: access.memberId,
                  exerciseId: plan.canonicalId,
                },
              },
            });

            if (existing) {
              await tx.memberExerciseAccess.delete({
                where: { id: access.id },
              });
            } else {
              await tx.memberExerciseAccess.update({
                where: { id: access.id },
                data: { exerciseId: plan.canonicalId },
              });
            }
          }
        }

        // D. Clean up alternative relationships
        for (const dupeId of plan.duplicateIds) {
          await tx.exercise.update({
            where: { id: dupeId },
            data: {
              alternatives: { set: [] },
              alternativeTo: { set: [] },
            },
          });
        }

        // E. Delete the duplicate exercise rows
        const delResult = await tx.exercise.deleteMany({
          where: { id: { in: plan.duplicateIds } },
        });
        console.log(`  - Successfully deleted ${delResult.count} duplicate exercise rows.`);
      }

      // Also clean up leaked test users and their test fixtures
      console.log("\n🧹 Cleaning up leaked test users and test fixtures...");
      const testUsers = await tx.user.findMany({
        where: {
          OR: [
            { email: { startsWith: "break_athlete_" } },
            { email: { startsWith: "adv_trainer_" } },
            { email: { startsWith: "adv_member_" } },
          ],
        },
        select: { id: true, email: true },
      });

      if (testUsers.length > 0) {
        console.log(`Found ${testUsers.length} test user(s) to remove:`, testUsers.map((u) => u.email));
        const testUserIds = testUsers.map((u) => u.id);

        // Delete test sessions
        const sessions = await tx.workoutSession.findMany({
          where: { memberId: { in: testUserIds } },
          select: { id: true },
        });
        const sessionIds = sessions.map((s) => s.id);
        if (sessionIds.length > 0) {
          await tx.workoutSetLog.deleteMany({
            where: { exerciseLog: { sessionId: { in: sessionIds } } },
          });
          await tx.workoutExerciseLog.deleteMany({
            where: { sessionId: { in: sessionIds } },
          });
          await tx.workoutSession.deleteMany({
            where: { id: { in: sessionIds } },
          });
        }

        // Delete test workouts
        const workouts = await tx.workout.findMany({
          where: { createdBy: { in: testUserIds } },
          select: { id: true },
        });
        const workoutIds = workouts.map((w) => w.id);
        if (workoutIds.length > 0) {
          await tx.workoutExercise.deleteMany({
            where: { workoutId: { in: workoutIds } },
          });
          await tx.assignment.deleteMany({
            where: { workoutId: { in: workoutIds } },
          });
          await tx.workout.deleteMany({
            where: { id: { in: workoutIds } },
          });
        }

        await tx.assignment.deleteMany({
          where: { memberId: { in: testUserIds } },
        });

        await tx.user.deleteMany({
          where: { id: { in: testUserIds } },
        });
        console.log(`  - Cleaned up ${testUsers.length} test users and all associated test data.`);
      } else {
        console.log("  - No test users to clean up.");
      }
    },
    { timeout: 60000, maxWait: 15000 }
  );

  console.log("\n✅ Database deduplication and merge completed successfully!");

  // 4. Verify post-merge count
  const remainingCount = await prisma.exercise.count();
  console.log(`Total active exercises remaining in database: ${remainingCount}`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
