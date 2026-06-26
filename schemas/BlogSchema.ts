import { z } from "zod";

export const BlogSchema = z.object({
  userId: z.string(),
  title: z
    .string()
    .min(10, { message: "Title is too short" })
    .max(150, { message: "Title is too long, max 150 characters" }),
  content: z.string(),
  coverImage: z.string().optional(),
  isPublished: z.boolean(),
  tags: z.array(z.string()),
});

export type BlogSchemaType = z.infer<typeof BlogSchema>;
