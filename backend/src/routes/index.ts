import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import workoutRoutes from "./workout.routes.js";
import trainerRoutes from "./trainer.routes.js";
import memberRoutes from "./member.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/workouts", workoutRoutes);
router.use("/trainers", trainerRoutes);
router.use("/members", memberRoutes);

export default router;
