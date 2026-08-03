import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// أي راوت جاي تحت السطر ده لازم يكون معاه Token شغال
router.use(protect);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users (with optional filters like ?role=TRAINER)
 *     security:
 *       - bearerAuth: []
 */
router.route("/").get(getAllUsers);

export default router;
