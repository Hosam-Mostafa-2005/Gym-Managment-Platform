// src/validators/gamification.validator.ts
import z from "zod";

export const sendEncouragementSchema = z.object({
  params: z.object({
    memberId: z.string().min(1, "Member ID is required"),
  }),
  body: z.object({
    message: z
      .string()
      .trim()
      .min(2, "Message must be at least 2 characters")
      .max(500, "Message must not exceed 500 characters"),
  }),
});
