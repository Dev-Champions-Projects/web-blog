import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(4, { message: "name must be 4 or more characters long" })
      .max(30, { message: "name must be 30 or fewer characters long" }),
    email: z.string().email(),
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

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
