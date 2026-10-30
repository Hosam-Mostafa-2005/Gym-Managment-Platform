import { z } from "zod";

export const createLoginSchema = (t?: (key: any, defaultValue?: any) => string) =>
  z.object({
    email: z
      .string()
      .email(
        t
          ? t("validation.invalidEmail", "Enter a valid email address.")
          : "Enter a valid email address.",
      ),
    password: z
      .string()
      .min(
        1,
        t ? t("validation.requiredPassword", "Enter your password.") : "Enter your password.",
      ),
  });

export const loginSchema = createLoginSchema();

export type LoginFormData = z.infer<typeof loginSchema>;
