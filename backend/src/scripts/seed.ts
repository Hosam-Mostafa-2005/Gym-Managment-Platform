import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../config/prisma.js";

// Import Seed Data Generators
import { usersData } from "./data/users.js";
import { exercisesData } from "./data/exercises.js";
import { generateWorkoutsData } from "./data/workouts.js";
import { generateAssignmentsData } from "./data/assignments.js";
import { generateWorkoutSessionsData } from "./data/workoutSessions.js";
import { generateWorkoutExerciseLogsData } from "./data/workoutExerciseLogs.js";
import { generateWorkoutSetLogsData } from "./data/workoutSetLogs.js";
import { generateBodyMeasurementsData } from "./data/bodyMeasurements.js";
import { generateNotificationsData } from "./data/notifications.js";
import { syncExerciseImages } from "./sync-exercise-images.js";

dotenv.config();

const exerciseVideoMap: Record<string, string> = {
  "Barbell Bench Press": "https://www.youtube.com/watch?v=rT7DgCr-3pg",
  "Incline Dumbbell Press": "https://www.youtube.com/watch?v=8iPEnn-ltC8",
  "Cable Crossover": "https://www.youtube.com/watch?v=taI4XduLpTk",
  "Push-Ups": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "Pec Deck Fly": "https://www.youtube.com/watch?v=eGjt4lk6g34",
  "Barbell Back Squat": "https://www.youtube.com/watch?v=bEv6CCg2BC8",
  "Romanian Deadlift": "https://www.youtube.com/watch?v=JCXUYuzwNrM",
  "Leg Press": "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
  "Pull-Ups": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
  "Barbell Bent-Over Row": "https://www.youtube.com/watch?v=9efgc2WgMoY",
  "Lat Pulldown": "https://www.youtube.com/watch?v=CAwf7n6Luuc",
  "Conventional Deadlift": "https://www.youtube.com/watch?v=op9kVnSso6Q",
  "Overhead Barbell Press": "https://www.youtube.com/watch?v=2yjwXTZQDDI",
  "Lateral Raises": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
  "Barbell Curl": "https://www.youtube.com/watch?v=kwG2ipFRgfo",
  "Tricep Rope Pushdown": "https://www.youtube.com/watch?v=vB5OHsJ3EME",
  "Hanging Leg Raises": "https://www.youtube.com/watch?v=Pr1ieGZ5atk",
  "Plank": "https://www.youtube.com/watch?v=ASdvN_XEl_c",
};

const seedDatabase = async (): Promise<void> => {
  console.log("====================================================");
  console.log("🌱 STARTING DATABASE SEED PROCESS (PostgreSQL / Prisma)...");
  console.log("====================================================\n");

  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const isSafeTarget =
      dbUrl.includes("localhost") ||
      dbUrl.includes("127.0.0.1") ||
      dbUrl.includes("stren_db") ||
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test";

    if (!isSafeTarget && process.env.ALLOW_SEED_RESET !== "true") {
      console.error(
        "❌ SAFETY GUARD: Refusing to perform destructive database reset on non-local target.",
      );
      console.error(`Target URL: ${dbUrl}`);
      console.error(
        "To override on a disposable staging environment, set ALLOW_SEED_RESET=true.",
      );
      process.exit(1);
    }

    console.log("🔌 Testing Prisma Database Connection...");
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL (confirmed local dev target).\n");

    console.log("🗑️  Purging existing database tables...");
    await prisma.scheduledWorkout.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.bodyMeasurement.deleteMany();
    await prisma.workoutSetLog.deleteMany();
    await prisma.workoutExerciseLog.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.workoutExercise.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ All existing records purged cleanly.\n");

    // 1. Seed Users
    console.log("👥 Seeding Users...");
    const createdUsers: any[] = [];
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role.toLowerCase() as any,
          phone: userData.phone,
          isActive: userData.isActive ?? true,
        },
      });
      createdUsers.push({ ...user, _id: user.id });
    }

    const admin = createdUsers.find((u) => u.role === "admin");
    const trainers = createdUsers.filter((u) => u.role === "trainer");
    const members = createdUsers.filter((u) => u.role === "member");

    // Independent member: Ahmed Mansour (index 0)
    const independentMember = members[0];
    // Connected member: Fatima Zahra (index 1)
    const connectedMember = members[1];
    // Resumable active session member: Youssef Ibrahim (index 2)
    const activeSessionMember = members[2];

    console.log(
      `✅ Inserted ${createdUsers.length} total users (${trainers.length} trainers, ${members.length} members).\n`,
    );

    // 2. Seed Exercises
    console.log("🤸 Seeding Training Exercises Library with Verified Media...");
    const createdExercises: any[] = [];
    for (const exData of exercisesData) {
      const video = exerciseVideoMap[exData.name] || exData.videoUrl || null;
      const existingEx = await prisma.exercise.findFirst({
        where: { name: exData.name, isCustom: false },
      });
      const exDataPayload = {
        name: exData.name,
        description: (exData as any).description || "",
        difficulty: exData.difficulty.toLowerCase() as any,
        equipment: exData.equipment || [],
        primaryMuscles: exData.primaryMuscles || [],
        secondaryMuscles: exData.secondaryMuscles || [],
        instructions: exData.instructions || [],
        tips: exData.tips || [],
        imageUrl: (exData as any).imageUrl || null,
        videoUrl: video,
        isActive: (exData as any).isActive ?? true,
      };
      const ex = existingEx
        ? await prisma.exercise.update({
            where: { id: existingEx.id },
            data: exDataPayload,
          })
        : await prisma.exercise.create({
            data: exDataPayload,
          });
      createdExercises.push({ ...ex, _id: ex.id });
    }
    console.log(`✅ Inserted ${createdExercises.length} foundational exercises with video tutorials.\n`);

    await syncExerciseImages();

    // 3. Link Exercise Alternatives
    console.log("🔗 Linking exercise alternatives dynamically...");
    for (const exercise of createdExercises) {
      const sameMusclePool = createdExercises.filter(
        (ex) =>
          ex.id !== exercise.id &&
          ex.primaryMuscles.some((m: string) => exercise.primaryMuscles.includes(m)),
      );

      if (sameMusclePool.length > 0) {
        const altCount = Math.min(sameMusclePool.length, 2);
        const shuffled = [...sameMusclePool].sort(() => 0.5 - Math.random());
        const altIds = shuffled.slice(0, altCount).map((ex) => ex.id);

        await prisma.exercise.update({
          where: { id: exercise.id },
          data: {
            alternatives: {
              connect: altIds.map((id) => ({ id })),
            },
          },
        });
      }
    }
    console.log("✅ Successfully mapped exercise alternatives.\n");

    // 4. Seed Workout Templates
    console.log("📋 Seeding Workout Templates...");
    const workoutsPayload = generateWorkoutsData(trainers, createdExercises);
    const createdWorkouts: any[] = [];
    for (const w of workoutsPayload) {
      const workout = await prisma.workout.create({
        data: {
          title: w.title,
          description: w.description,
          category: (w.category as string).toLowerCase() as any,
          difficulty: (w.difficulty as string).toLowerCase() as any,
          estimatedDuration: w.estimatedDuration,
          tags: w.tags || [],
          isTemplate: w.isTemplate,
          creator: {
            connect: { id: w.createdBy },
          },
          exercises: {
            create: w.exercises.map((we: any) => ({
              exercise: { connect: { id: we.exercise } },
              sets: we.sets,
              reps: we.reps,
              restSeconds: we.restSeconds,
              notes: we.notes,
              order: we.order,
            })),
          },
        },
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      });
      createdWorkouts.push({
        ...workout,
        _id: workout.id,
        exercises: workout.exercises.map((we) => ({
          exercise: { _id: we.exerciseId, name: we.exercise.name },
          sets: we.sets,
          reps: we.reps,
          restSeconds: we.restSeconds,
          notes: we.notes,
          order: we.order,
        })),
      });
    }

    // Seed Member Personal Workouts for Ahmed Mansour (independent member)
    console.log("🏋️ Seeding Personal Routines for Independent Member (Ahmed Mansour)...");
    const benchPressEx = createdExercises.find((e) => e.name === "Barbell Bench Press")!;
    const rowEx = createdExercises.find((e) => e.name === "Barbell Bent-Over Row")!;
    const squatEx = createdExercises.find((e) => e.name === "Barbell Back Squat")!;

    const personalWorkout1 = await prisma.workout.create({
      data: {
        title: "Ahmed's Push & Upper Power Routine",
        description: "My personal heavy chest and upper body workout.",
        category: "strength",
        difficulty: "intermediate",
        estimatedDuration: 55,
        tags: ["Personal", "Upper Body", "Strength"],
        isTemplate: false,
        creator: { connect: { id: independentMember.id } },
        exercises: {
          create: [
            {
              exercise: { connect: { id: benchPressEx.id } },
              sets: 3,
              reps: "8-10",
              restSeconds: 90,
              notes: "Pause at bottom of each rep",
              order: 1,
            },
            {
              exercise: { connect: { id: rowEx.id } },
              sets: 3,
              reps: "8-10",
              restSeconds: 90,
              notes: "Strict torso angle",
              order: 2,
            },
          ],
        },
      },
      include: {
        exercises: { include: { exercise: true } },
      },
    });
    createdWorkouts.push({ ...personalWorkout1, _id: personalWorkout1.id });

    console.log(`✅ Inserted ${createdWorkouts.length} total workouts (including member personal routines).\n`);

    // 5. Seed Member Assignments (excluding Ahmed Mansour, who remains 100% independent!)
    console.log("📌 Seeding Member-Trainer Assignments...");
    const assignmentsPayload = generateAssignmentsData(
      members.slice(1), // Member 0 (Ahmed) has NO assignment!
      trainers,
      createdWorkouts.filter((w) => w.isTemplate),
    );
    const createdAssignments: any[] = [];
    for (const a of assignmentsPayload) {
      const assignment = await prisma.assignment.create({
        data: {
          member: { connect: { id: a.member } },
          trainer: { connect: { id: a.trainer } },
          workout: { connect: { id: a.workout } },
          startDate: a.startDate,
          endDate: a.endDate,
          status: a.status.toUpperCase() as any,
          notes: a.notes,
        },
      });
      createdAssignments.push({
        ...assignment,
        _id: assignment.id,
        member: assignment.memberId,
        trainer: assignment.trainerId,
        workout: assignment.workoutId,
      });
    }
    console.log(
      `✅ Assigned ${createdAssignments.length} members to coaches (Ahmed Mansour remains independent).\n`,
    );

    // 6. Seed Workout Sessions
    console.log("⏱️  Seeding Workout Sessions...");
    const sessionsPayload = generateWorkoutSessionsData(createdAssignments);
    const createdSessions: any[] = [];
    for (const s of sessionsPayload) {
      const session = await prisma.workoutSession.create({
        data: {
          assignment: { connect: { id: s.assignment } },
          member: { connect: { id: s.member } },
          startedAt: s.startedAt,
          endedAt: s.endedAt,
          duration: s.duration,
          status: s.status.toUpperCase() as any,
          notes: s.notes,
        },
      });
      createdSessions.push({
        ...session,
        _id: session.id,
        assignment: session.assignmentId,
        member: session.memberId,
      });
    }

    // Seed Completed Historical Sessions for Independent Member (Ahmed Mansour)
    // 2 Completed Sessions for performance progression testing
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const sevenDaysAgoEnd = new Date(sevenDaysAgo.getTime() + 50 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 3600 * 1000);
    const twoDaysAgoEnd = new Date(twoDaysAgo.getTime() + 52 * 60 * 1000);

    const ahmedSession1 = await prisma.workoutSession.create({
      data: {
        memberId: independentMember.id,
        workoutId: personalWorkout1.id,
        status: "COMPLETED",
        startedAt: sevenDaysAgo,
        endedAt: sevenDaysAgoEnd,
        duration: 50,
        totalVolume: 3240,
        setsCompleted: 6,
        exercisesCompleted: 2,
        progress: 100,
        notes: "First time running this push routine. Felt solid.",
      },
    });

    const ahmedSession2 = await prisma.workoutSession.create({
      data: {
        memberId: independentMember.id,
        workoutId: personalWorkout1.id,
        status: "COMPLETED",
        startedAt: twoDaysAgo,
        endedAt: twoDaysAgoEnd,
        duration: 52,
        totalVolume: 3510,
        setsCompleted: 6,
        exercisesCompleted: 2,
        progress: 100,
        notes: "Increased weight by 5kg on bench press and rows! Good energy.",
      },
    });

    // Seed Logs for Ahmed's Historical Sessions (Session 1: 60kg, Session 2: 65kg)
    const ahmedS1Log1 = await prisma.workoutExerciseLog.create({
      data: {
        sessionId: ahmedSession1.id,
        exerciseId: benchPressEx.id,
        exerciseName: benchPressEx.name,
        targetSets: 3,
        targetReps: "8-10",
        order: 1,
        completed: true,
      },
    });
    for (let s = 1; s <= 3; s++) {
      await prisma.workoutSetLog.create({
        data: {
          exerciseLogId: ahmedS1Log1.id,
          setNumber: s,
          weight: 60,
          actualReps: 10,
          completed: true,
          restDuration: 90,
          completedAt: new Date(sevenDaysAgo.getTime() + s * 5 * 60 * 1000),
        },
      });
    }

    const ahmedS1Log2 = await prisma.workoutExerciseLog.create({
      data: {
        sessionId: ahmedSession1.id,
        exerciseId: rowEx.id,
        exerciseName: rowEx.name,
        targetSets: 3,
        targetReps: "8-10",
        order: 2,
        completed: true,
      },
    });
    for (let s = 1; s <= 3; s++) {
      await prisma.workoutSetLog.create({
        data: {
          exerciseLogId: ahmedS1Log2.id,
          setNumber: s,
          weight: 50,
          actualReps: 10,
          completed: true,
          restDuration: 90,
          completedAt: new Date(sevenDaysAgo.getTime() + (s + 3) * 5 * 60 * 1000),
        },
      });
    }

    // Ahmed Session 2 logs (higher weight!)
    const ahmedS2Log1 = await prisma.workoutExerciseLog.create({
      data: {
        sessionId: ahmedSession2.id,
        exerciseId: benchPressEx.id,
        exerciseName: benchPressEx.name,
        targetSets: 3,
        targetReps: "8-10",
        order: 1,
        completed: true,
      },
    });
    for (let s = 1; s <= 3; s++) {
      await prisma.workoutSetLog.create({
        data: {
          exerciseLogId: ahmedS2Log1.id,
          setNumber: s,
          weight: 65,
          actualReps: 10,
          completed: true,
          restDuration: 90,
          completedAt: new Date(twoDaysAgo.getTime() + s * 5 * 60 * 1000),
        },
      });
    }

    const ahmedS2Log2 = await prisma.workoutExerciseLog.create({
      data: {
        sessionId: ahmedSession2.id,
        exerciseId: rowEx.id,
        exerciseName: rowEx.name,
        targetSets: 3,
        targetReps: "8-10",
        order: 2,
        completed: true,
      },
    });
    for (let s = 1; s <= 3; s++) {
      await prisma.workoutSetLog.create({
        data: {
          exerciseLogId: ahmedS2Log2.id,
          setNumber: s,
          weight: 55,
          actualReps: 10,
          completed: true,
          restDuration: 90,
          completedAt: new Date(twoDaysAgo.getTime() + (s + 3) * 5 * 60 * 1000),
        },
      });
    }

    // Seed Active Live Session for Member 3 (Youssef Ibrahim)
    console.log("🔴 Seeding Active In-Progress Workout Session for Youssef Ibrahim...");
    const activeStartedAt = new Date(Date.now() - 25 * 60 * 1000); // 25 mins ago
    const activeAssignment = createdAssignments.find((a) => a.memberId === activeSessionMember.id);
    const activeWorkout = createdWorkouts.find((w) => w.id === activeAssignment?.workoutId) || createdWorkouts[0];

    const activeSession = await prisma.workoutSession.create({
      data: {
        memberId: activeSessionMember.id,
        assignmentId: activeAssignment?.id || null,
        workoutId: activeWorkout.id,
        status: "IN_PROGRESS",
        startedAt: activeStartedAt,
        duration: 25,
        totalVolume: 1200,
        setsCompleted: 2,
        exercisesCompleted: 1,
        progress: 50,
        notes: "Testing live workout resuming capabilities.",
      },
    });

    const activeLog1 = await prisma.workoutExerciseLog.create({
      data: {
        sessionId: activeSession.id,
        exerciseId: benchPressEx.id,
        exerciseName: benchPressEx.name,
        targetSets: 3,
        targetReps: "10",
        order: 1,
        completed: true,
      },
    });

    await prisma.workoutSetLog.create({
      data: {
        exerciseLogId: activeLog1.id,
        setNumber: 1,
        weight: 70,
        actualReps: 10,
        completed: true,
        restDuration: 60,
        completedAt: new Date(activeStartedAt.getTime() + 5 * 60 * 1000),
      },
    });

    await prisma.workoutSetLog.create({
      data: {
        exerciseLogId: activeLog1.id,
        setNumber: 2,
        weight: 70,
        actualReps: 10,
        completed: true,
        restDuration: 60,
        completedAt: new Date(activeStartedAt.getTime() + 10 * 60 * 1000),
      },
    });

    await prisma.workoutSetLog.create({
      data: {
        exerciseLogId: activeLog1.id,
        setNumber: 3,
        weight: 70,
        actualReps: 8,
        completed: false,
      },
    });

    const activeLog2 = await prisma.workoutExerciseLog.create({
      data: {
        sessionId: activeSession.id,
        exerciseId: rowEx.id,
        exerciseName: rowEx.name,
        targetSets: 3,
        targetReps: "10",
        order: 2,
        completed: false,
      },
    });

    for (let s = 1; s <= 3; s++) {
      await prisma.workoutSetLog.create({
        data: {
          exerciseLogId: activeLog2.id,
          setNumber: s,
          targetReps: "10",
          weight: 60,
          actualReps: 0,
          completed: false,
        },
      });
    }

    // 7. Seed Workout Exercise Logs for other sessions
    console.log("📈 Seeding Workout Exercise Logs...");
    const completedSessions = createdSessions.filter(
      (s) => s.status === "COMPLETED",
    );
    const exerciseLogsPayload = generateWorkoutExerciseLogsData(
      completedSessions,
      createdWorkouts,
      createdAssignments,
    );
    const createdExerciseLogs: any[] = [];
    for (const l of exerciseLogsPayload) {
      const log = await prisma.workoutExerciseLog.create({
        data: {
          session: { connect: { id: l.session } },
          exercise: { connect: { id: l.exercise } },
          exerciseName: l.exerciseName,
          targetSets: l.targetSets,
          targetReps: l.targetReps,
          order: l.order,
          completed: l.completed,
        },
      });
      createdExerciseLogs.push({
        ...log,
        _id: log.id,
        session: log.sessionId,
        exercise: log.exerciseId,
      });
    }

    // 8. Seed Workout Set Logs for other sessions
    console.log("🔢 Seeding Workout Set Logs...");
    const setLogsPayload = generateWorkoutSetLogsData(createdExerciseLogs);
    for (const s of setLogsPayload) {
      await prisma.workoutSetLog.create({
        data: {
          exerciseLog: { connect: { id: s.exerciseLog } },
          setNumber: s.setNumber,
          targetReps: s.targetReps,
          actualReps: s.actualReps,
          weight: s.weight,
          restDuration: s.restDuration,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
          completed: s.completed,
        },
      });
    }

    // 9. Seed Scheduled Workouts
    console.log("📅 Seeding Scheduled Workouts (Upcoming and Past)...");
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(18, 0, 0, 0);

    const inThreeDays = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    inThreeDays.setHours(9, 30, 0, 0);

    const pastDate = new Date(Date.now() - 5 * 24 * 3600 * 1000);

    // Scheduled for Independent Member (Ahmed Mansour)
    await prisma.scheduledWorkout.create({
      data: {
        memberId: independentMember.id,
        workoutId: personalWorkout1.id,
        scheduledAt: tomorrow,
        notes: "Aiming for 3x10 at 70kg on bench press",
        status: "SCHEDULED",
      },
    });

    // Scheduled for Connected Member (Fatima Zahra)
    const fatimaAssignment = createdAssignments.find((a) => a.memberId === connectedMember.id);
    if (fatimaAssignment) {
      await prisma.scheduledWorkout.create({
        data: {
          memberId: connectedMember.id,
          workoutId: fatimaAssignment.workoutId,
          assignmentId: fatimaAssignment.id,
          scheduledAt: inThreeDays,
          notes: "Coach Omar's prescribed intensity block",
          status: "SCHEDULED",
        },
      });

      await prisma.scheduledWorkout.create({
        data: {
          memberId: connectedMember.id,
          workoutId: fatimaAssignment.workoutId,
          assignmentId: fatimaAssignment.id,
          scheduledAt: pastDate,
          notes: "Completed last week",
          status: "COMPLETED",
        },
      });
    }

    // 10. Seed Body Measurements
    console.log("⚖️ Seeding Body Measurements History...");
    const measurementsPayload = generateBodyMeasurementsData(createdAssignments);
    for (const m of measurementsPayload) {
      await prisma.bodyMeasurement.create({
        data: {
          member: { connect: { id: m.member } },
          trainer: { connect: { id: m.trainer } },
          weight: m.weight,
          height: m.height,
          bodyFat: m.bodyFat,
          chest: m.circumferences?.chest,
          waist: m.circumferences?.waist,
          hips: m.circumferences?.hips,
          shoulders: m.circumferences?.shoulders,
          notes: m.notes,
          measuredAt: m.measuredAt,
          isActive: m.isActive,
        },
      });
    }

    // Independent member self-recorded measurements
    await prisma.bodyMeasurement.create({
      data: {
        memberId: independentMember.id,
        weight: 78.5,
        height: 178,
        bodyFat: 14.5,
        chest: 104,
        waist: 82,
        hips: 98,
        measuredAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        notes: "Starting weight for new mesocycle",
      },
    });

    await prisma.bodyMeasurement.create({
      data: {
        memberId: independentMember.id,
        weight: 79.2,
        height: 178,
        bodyFat: 14.2,
        chest: 105.5,
        waist: 81.5,
        hips: 98.5,
        measuredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        notes: "Noticeable muscle definition in chest and delts",
      },
    });

    // 11. Seed Notifications
    console.log("🔔 Seeding Notifications...");
    const notificationsPayload = generateNotificationsData(
      createdUsers,
      createdAssignments,
      createdSessions,
      [],
    );
    for (const n of notificationsPayload) {
      await prisma.notification.create({
        data: {
          user: { connect: { id: n.user } },
          title: n.title,
          message: n.message,
          type: n.type.toUpperCase() as any,
          readAt: n.readAt,
          actionUrl: n.actionUrl,
          metadata: n.metadata,
          isActive: n.isActive,
          createdAt: (n as any).createdAt || new Date(),
        },
      });
    }

    console.log("====================================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("====================================================");
    console.log(`🔑 TEST ACCOUNTS (Password: 12345678):`);
    console.log(`   👑 Admin: admin@gym.com`);
    console.log(`   🏋️ Coach: omar@gym.com`);
    console.log(`   🧍 Independent Member: member1@gym.com (Ahmed Mansour - No Coach, Personal Workouts)`);
    console.log(`   🤝 Connected Member: member2@gym.com (Fatima Zahra - Coach Omar, Scheduled Sessions)`);
    console.log(`   🔴 Active Session Member: member3@gym.com (Youssef Ibrahim - Has In-Progress Workout)`);
    console.log("====================================================\n");
  } catch (error) {
    console.error("❌ ERROR DURING DATABASE SEEDING:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
};

seedDatabase();
