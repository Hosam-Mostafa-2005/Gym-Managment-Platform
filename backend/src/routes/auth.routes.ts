import { Router } from "express";
import validate from "../middleware/validate.middleware.js";

import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} from "../controllers/auth.controller.js";

import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
} from "../validators/auth.validator.js";

import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

router.get("/admin", protect, restrictTo(Roles.ADMIN), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome Admin",
  });
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new trainer or member account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hosam
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hosam@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Validation error.
 */

router.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate user and return JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hosam@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */

router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logout the current user by clearing the authentication cookie.
 *     responses:
 *       200:
 *         description: Logout successful.
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/update-password:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Update user password
 *     description: Update the authenticated user's password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       401:
 *         description: Unauthorized.
 *       400:
 *         description: Validation error.
 */
router.patch(
  "/update-password",
  protect,
  validate(updatePasswordSchema),
  updatePassword,
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user
 *     description: Returns the authenticated user's information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information returned successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /auth/admin:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Admin test route
 *     description: Accessible only by users with the Admin role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome Admin.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get("/admin", protect, restrictTo(Roles.ADMIN), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome Admin",
  });
});
export default router;
