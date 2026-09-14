import { z } from "zod";
import { Roles } from "../constants/roles.js";

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(3).max(50),

      email: z.email().trim().toLowerCase(),

      password: z.string().min(8).max(100),

      role: z.enum([Roles.ADMIN, Roles.TRAINER, Roles.MEMBER]),

      bio: z.string().trim().max(1000).optional(),

      specialties: z.array(z.string().trim()).optional(),

      certifications: z.array(z.string().trim()).optional(),

      yearsOfExperience: z.number().int().min(0).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === Roles.TRAINER) {
        if (!data.bio) {
          ctx.addIssue({
            code: "custom",
            path: ["bio"],
            message: "Bio is required for trainers.",
          });
        }

        if (!data.yearsOfExperience && data.yearsOfExperience !== 0) {
          ctx.addIssue({
            code: "custom",
            path: ["yearsOfExperience"],
            message: "Years of experience is required for trainers.",
          });
        }
      }
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
