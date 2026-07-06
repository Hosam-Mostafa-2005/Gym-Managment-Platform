import express from "express";
import routes from "./routes/index.js";
import globalErrorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.middleware.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", routes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test Route
app.get("/", (req, res) => {
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
