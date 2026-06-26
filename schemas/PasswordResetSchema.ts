import { z } from "zod";

export const PasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "password must be 6 or more characters long!" }),
    confirmPassword: z.string(),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Password must match!",
      path: ["confirmPassword"],
    }
  );

export type PasswordResetSchemaType = z.infer<typeof PasswordResetSchema>;
