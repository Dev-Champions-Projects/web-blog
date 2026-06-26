import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "password must be 6 or more characters long!" }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
