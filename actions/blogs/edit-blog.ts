"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/lib/user";
import { BlogSchema, BlogSchemaType } from "@/schemas/BlogSchema";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export const editBlog = async (values: BlogSchemaType, blogId: string) => {
  const vFields = BlogSchema.safeParse(values);

  if (!vFields.success) return { error: "Invalid Fields!" };

  const { userId, isPublished } = vFields.data;

  const user = await getUserById(userId);

  if (!user) return { error: "User does not exist!" };

  if (isPublished && !user.emailVerified) {
    return { error: "Not authorized! Verify your email!" };
  }

  const blog = await db.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) return { error: "Blog not found!" };

  const updateData: any = {
    ...vFields.data,

    youtubeUrl:
      vFields.data.youtubeUrl ||
      null,
  };
  // if title changed, regenerate slug
  if (vFields.data.title && vFields.data.title !== blog.title) {
    const base = slugify(vFields.data.title || "");
    let finalSlug: string | undefined = base || undefined;
    if (finalSlug) {
      let candidate = finalSlug;
      let i = 1;
      while (await db.blog.findUnique({ where: { slug: candidate } })) {
        i += 1;
        candidate = `${finalSlug}-${i}`;
      }
      finalSlug = candidate;
    }
    updateData.slug = finalSlug;
  }

  await db.blog.update({
    where: { id: blogId },
    data: updateData,
  });

  try {
    const slugToUse = updateData.slug ?? blog.slug;
    const path = slugToUse ? `/blog/details/${slugToUse}-${blogId}` : `/blog/details/${blogId}`;
    revalidatePath(path);
    revalidatePath(`/blog/feed/1`);
    revalidatePath(`/user/${userId}/1`);
  } catch (e) {
    // ignore
  }

  const slugToUse = updateData.slug ?? blog.slug;
  return { success: "Blog Updated", blogId: blogId, slug: slugToUse };
};
