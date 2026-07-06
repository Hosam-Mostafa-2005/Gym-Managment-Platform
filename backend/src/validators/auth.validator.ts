import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(50),

    email: z.email().trim().toLowerCase(),

    password: z.string().min(8).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),

    password: z.string().min(8),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),

    newPassword: z.string().min(8),
  }),
});
