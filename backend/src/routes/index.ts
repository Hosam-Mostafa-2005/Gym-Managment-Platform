import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import workoutRoutes from "./workout.routes.js";
import trainerRoutes from "./trainer.routes.js";
import memberRoutes from "./member.routes.js";
import exerciseRoutes from "./exercise.routes.js";
import assignmentRouter from "./assignment.routes.js";
import workoutSessionRoutes from "./workout-session.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import workoutSetRoutes from "./workout-set.routes.js";
import workoutExerciseLogRoutes from "./workout-exercise-log.routes.js";
import notificationRouter from "./notification.routes.js";
import coachDashboardRoutes from "./coach-dashboard.routes.js";
import coachProfileRoutes from "./coach-profile.routes.js";
import memberProfileRoutes from "./member-profile.routes.js";
import memberInsightsRoutes from "./member-insights.routes.js";
import membersManagementRoutes from "./members-management.routes.js";
import bodyMeasurementRoutes from "./body-measurement.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/users", userRoutes);
router.use("/trainers", trainerRoutes);
router.use("/members", memberRoutes);

router.use("/exercises", exerciseRoutes);
router.use("/workouts", workoutRoutes);

router.use("/assignments", assignmentRouter);
router.use("/workout-sessions", workoutSessionRoutes);
router.use("/workout-exercise-logs", workoutExerciseLogRoutes);
router.use("/workout-set-logs", workoutSetRoutes);
router.use("/notifications", notificationRouter);

router.use("/dashboard", dashboardRouter);

router.use("/coach-dashboard", coachDashboardRoutes);
router.use("/coach-profile", coachProfileRoutes);

router.use("/member-profile", memberProfileRoutes);
router.use("/member-insights", memberInsightsRoutes);
router.use("/members-management", membersManagementRoutes);

router.use("/body-measurements", bodyMeasurementRoutes);

export default router;
