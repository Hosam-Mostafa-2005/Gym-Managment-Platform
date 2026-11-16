import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

let io: Server;

interface JwtPayload {
  id: string;
  iat?: number;
}

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (
    origin === process.env.CLIENT_URL ||
    origin === "http://localhost:5173" ||
    origin === "http://localhost:4173" ||
    origin === "http://localhost:3000" ||
    origin === "https://gym-managment-platform-seven.vercel.app" ||
    origin === "https://gym-managment-platform-54rwrqapc-hosso1.vercel.app" ||
    (origin.startsWith("https://gym-managment-platform-") &&
      origin.endsWith(".vercel.app"))
  ) {
    return true;
  }
  return false;
};

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, isActive: true, passwordChangedAt: true },
      });

      if (!currentUser || !currentUser.isActive) {
        return next(new Error("This user account is not active."));
      }

      if (currentUser.passwordChangedAt && decoded.iat) {
        const changedTimestamp = Math.floor(
          currentUser.passwordChangedAt.getTime() / 1000,
        );
        if (decoded.iat < changedTimestamp) {
          return next(
            new Error("Password changed recently. Please log in again."),
          );
        }
      }

      socket.data.userId = decoded.id;

      next();
    } catch {
      next(new Error("Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    socket.join(`user:${userId}`);

    console.log(`✅ ${userId} connected`);

    socket.on("disconnect", () => {
      console.log(`❌ ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};
