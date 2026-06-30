import { Router } from "express";

import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} from "../controllers/auth.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

router.get("/admin", protect, restrictTo(Roles.ADMIN), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome Admin",
  });
});

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.patch("/update-password", protect, updatePassword);

router.get("/me", protect, getMe);

export default router;
