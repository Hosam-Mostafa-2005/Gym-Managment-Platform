import express, { type Request, type Response } from "express";
import path from "node:path";
import routes from "./routes/index.js";
import globalErrorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.middleware.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import cors from "cors";
import { env } from "./config/env.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  env.CLIENT_URL,
  "https://gym-managment-platform-seven.vercel.app",
  "https://gym-managment-platform-54rwrqapc-hosso1.vercel.app",
].filter(Boolean);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Serve uploaded static assets when local storage is used
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"), {
    setHeaders: (res: Response) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// Routes
app.use("/api/v1", routes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Gym Management API is running...",
  });
});

// 404
app.use(notFound);

// Error Handler
app.use(globalErrorHandler);
export default app;
