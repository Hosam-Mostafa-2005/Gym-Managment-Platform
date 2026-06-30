import express from "express";
import routes from "./routes/index.js";
import globalErrorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", routes);

app.use(notFound);

app.use(globalErrorHandler);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Gym Management API is running...",
  });
});

export default app;
