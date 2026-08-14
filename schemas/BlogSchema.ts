import { z } from "zod";
import {
  getYouTubeVideoId,
} from "@/lib/youtube";

export const BlogSchema = z.object({
  userId: z.string(),

  title: z
    .string()
    .min(10, {
      message:
        "Title is too short",
    })
    .max(150, {
      message:
        "Title is too long, max 150 characters",
    }),

  content: z.string(),

  coverImage:
    z.string().optional(),

  /*
   * Optional YouTube video.
   *
   * Empty value is allowed.
   * If provided, it must be a valid
   * YouTube URL or video ID.
   */
  youtubeUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        getYouTubeVideoId(value) !==
        null,
      {
        message:
          "Enter a valid YouTube video URL",
      },
    )
    .optional(),

  isPublished: z.boolean(),

  tags: z.array(z.string()),
});

export type BlogSchemaType =
  z.infer<typeof BlogSchema>;