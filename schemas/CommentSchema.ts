import { z } from "zod";

export const CommentSchema = z.object({
  content: z
    .string()
    .min(4, { message: "comment is too short" })
    .max(500, { message: "your comment is too long, max 500 characters" }),
});

export type CommentSchemaType = z.infer<typeof CommentSchema>;
