import { z } from "zod";

export const createRegisterSchema = (t?: (key: any, defaultValue?: any) => string) =>
  z
    .object({
      name: z
        .string()
        .min(
          3,
          t
            ? t("validation.nameMinLength", "Name must be at least 3 characters")
            : "Name must be at least 3 characters",
        ),

      email: z
        .string()
        .email(
          t
            ? t("validation.invalidEmail", "Please enter a valid email")
            : "Please enter a valid email",
        ),

      password: z
        .string()
        .min(
          8,
          t
            ? t("validation.passwordMinLength", "Password must be at least 8 characters")
            : "Password must be at least 8 characters",
        ),

      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t
        ? t("validation.passwordMismatch", "Passwords do not match")
        : "Passwords do not match",
    });

export const registerSchema = createRegisterSchema();

export type RegisterFormData = z.infer<typeof registerSchema>;
