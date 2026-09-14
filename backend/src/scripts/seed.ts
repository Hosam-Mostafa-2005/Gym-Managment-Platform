import mongoose from "mongoose";
import dotenv from "dotenv";

// Import Mongoose Models (Matched exactly to your export styles)
import User from "../models/User.model.js";
import Exercise from "../models/Exercise.model.js";
import Workout from "../models/Workout.model.js";
import { Assignment } from "../models/Assignment.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import WorkoutExerciseLog from "../models/WorkoutExerciseLog.model.js";
import WorkoutSetLog from "../models/WorkoutSetLog.model.js";
import BodyMeasurement from "../models/BodyMeasurement.model.js";
import Notification from "../models/Notification.model.js";

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

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/gym-management";

const seedDatabase = async (): Promise<void> => {
  console.log("====================================================");
  console.log("🌱 STARTING DATABASE SEED PROCESS...");
  console.log("====================================================\n");

  try {
    console.log(`🔌 Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB.\n");

    console.log("🗑️  Purging existing database collections...");
    await Notification.deleteMany({});
    await BodyMeasurement.deleteMany({});
    await WorkoutSetLog.deleteMany({});
    await WorkoutExerciseLog.deleteMany({});
    await WorkoutSession.deleteMany({});
    await Assignment.deleteMany({});
    await Workout.deleteMany({});
    await Exercise.deleteMany({});
    await User.deleteMany({});
    console.log("✅ All existing collections dropped cleanly.\n");

    // 1. Seed Users
    console.log("👥 Seeding Users...");
    const createdUsers: any[] = [];
    for (const userData of usersData) {
      const user = await User.create(userData as any);
      createdUsers.push(user);
    }

    const admin = createdUsers.find((u) => u.role?.toLowerCase() === "admin");
    const trainers = createdUsers.filter(
      (u) => u.role?.toLowerCase() === "trainer",
    );
    const members = createdUsers.filter(
      (u) => u.role?.toLowerCase() === "member",
    );

    console.log(
      `✅ Inserted ${createdUsers.length} total users (${trainers.length} trainers, ${members.length} members).\n`,
    );

    if (trainers.length === 0 || members.length === 0) {
      throw new Error("Missing trainers or members! Aborting seed.");
    }

    // 2. Seed Exercises (Directly inserted to match constant/model definitions)
    console.log("🤸 Seeding Training Exercises Library...");
    const createdExercises = await Exercise.insertMany(exercisesData);
    console.log(
      `✅ Inserted ${createdExercises.length} foundational exercises.\n`,
    );

    // 3. Reconnect Exercise Alternatives
    console.log("🔗 Linking exercise alternatives dynamically...");
    for (const exercise of createdExercises) {
      const sameMusclePool = createdExercises.filter(
        (ex) =>
          ex._id.toString() !== exercise._id.toString() &&
          ex.primaryMuscles.some((m) => exercise.primaryMuscles.includes(m)),
      );

      if (sameMusclePool.length > 0) {
        const altCount = Math.min(sameMusclePool.length, 2);
        const shuffled = [...sameMusclePool].sort(() => 0.5 - Math.random());
        await Exercise.findByIdAndUpdate(exercise._id, {
          $set: {
            alternatives: shuffled.slice(0, altCount).map((ex) => ex._id),
          },
        });
      }
    }
    console.log("✅ Successfully mapped exercise alternatives.\n");

    // 4. Seed Workout Templates
    console.log("📋 Seeding Workout Templates...");
    const workoutsPayload = generateWorkoutsData(trainers, createdExercises);
    const createdWorkouts = await Workout.insertMany(workoutsPayload);
    console.log(`✅ Inserted ${createdWorkouts.length} workout templates.\n`);

    // 5. Seed Member Assignments
    console.log("📌 Seeding Member-Trainer Assignments...");
    const assignmentsPayload = generateAssignmentsData(
      members,
      trainers,
      createdWorkouts,
    );
    const createdAssignments = await Assignment.insertMany(assignmentsPayload);
    console.log(
      `✅ Assigned all ${createdAssignments.length} members to coaches and routines.\n`,
    );

    // 6. Seed Workout Sessions
    console.log("⏱️  Seeding Workout Sessions...");
    const sessionsPayload = generateWorkoutSessionsData(createdAssignments);
    const createdSessions = await WorkoutSession.insertMany(sessionsPayload);

    const completedSessions = createdSessions.filter(
      (s) => s.status?.toLowerCase() === "completed",
    );
    console.log(
      `✅ Inserted ${createdSessions.length} workout sessions (${completedSessions.length} completed).\n`,
    );

    // 7. Seed Workout Exercise Logs
    console.log("📈 Seeding Workout Exercise Logs...");
    const exerciseLogsPayload = generateWorkoutExerciseLogsData(
      completedSessions,
      createdWorkouts,
      createdAssignments,
    );
    const createdExerciseLogs =
      await WorkoutExerciseLog.insertMany(exerciseLogsPayload);
    console.log(
      `✅ Inserted ${createdExerciseLogs.length} workout exercise logs.\n`,
    );

    // 8. Seed Workout Set Logs
    console.log("🔢 Seeding Workout Set Logs...");
    const setLogsPayload = generateWorkoutSetLogsData(createdExerciseLogs);
    const createdSetLogs = await WorkoutSetLog.insertMany(setLogsPayload);
    console.log(`✅ Inserted ${createdSetLogs.length} workout set logs.\n`);

    // 9. Seed Body Measurements
    console.log("⚖️ Seeding Body Measurements...");
    const measurementsPayload =
      generateBodyMeasurementsData(createdAssignments);
    const createdMeasurements =
      await BodyMeasurement.insertMany(measurementsPayload);
    console.log(
      `✅ Inserted ${createdMeasurements.length} body measurements.\n`,
    );

    // 10. Seed Notifications
    console.log("🔔 Seeding Notifications...");
    const notificationsPayload = generateNotificationsData(
      createdUsers,
      createdAssignments,
      createdSessions,
      createdMeasurements,
    );
    const createdNotifications =
      await Notification.insertMany(notificationsPayload);
    console.log(`✅ Inserted ${createdNotifications.length} notifications.\n`);

    console.log("====================================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("====================================================");
    console.table({
      Users: createdUsers.length,
      Exercises: createdExercises.length,
      Workouts: createdWorkouts.length,
      Assignments: createdAssignments.length,
      WorkoutSessions: createdSessions.length,
      WorkoutExerciseLogs: createdExerciseLogs.length,
      WorkoutSetLogs: createdSetLogs.length,
      BodyMeasurements: createdMeasurements.length,
      Notifications: createdNotifications.length,
    });
    console.log("====================================================\n");
  } catch (error) {
    console.error("❌ ERROR DURING DATABASE SEEDING:");
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
