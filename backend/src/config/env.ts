import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
  DATABASE_URL: process.env.DATABASE_URL!,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  PUBLIC_API_URL:
    process.env.PUBLIC_API_URL ||
    `http://localhost:${process.env.PORT || "5000"}`,

  // Persistent Image Storage Configuration
  // Supported providers: "cloudinary" | "supabase" | "local" (auto-detected if omitted)
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "",

  // Option 1: Cloudinary (Recommended)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "stren/exercises",

  // Option 2: Supabase Storage
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || "exercises",

  // Email Delivery Configuration
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "console",
  EMAIL_FROM: process.env.EMAIL_FROM || "STREN <no-reply@stren.app>",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL59_KEY: process.env.EMAIL59_KEY || "",

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID:
    process.env.GOOGLE_CLIENT_ID ||
    "223238339735-74boaq5cf0ntijdv7of6eb358cgkoqo2.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
};
