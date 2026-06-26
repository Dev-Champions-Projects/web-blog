import { z } from "zod";

export const EditProfileSchema = z.object({
  name: z
    .string()
    .min(4, { message: "name must be 4 or more characters long" })
    .max(30, { message: "name must be 30 or fewer characters long" }),
  email: z.string().email(),
  bio: z.string().optional(),
  tags: z.array(z.string()),
});

export type EditProfileSchemaType = z.infer<typeof EditProfileSchema>;
